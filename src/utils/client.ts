import koffi from 'koffi';
import TlsDependency from './path.js';
import path from 'node:path';
import fs from 'node:fs';
import { writeFile } from 'node:fs/promises';

/**
 * Configuration options for the ModuleClient
 */
export interface ModuleClientOptions {
    /** Path to a custom TLS library */
    customLibraryPath?: string;
    /** Path to download the TLS library */
    customLibraryDownloadPath?: string;
}

type KoffiAsyncFn = ((...args: unknown[]) => unknown) & {
    async: (...argsWithCallback: unknown[]) => void;
};

/**
 * @classdesc Manages the TLS library and FFI bindings.
 *
 * Uses koffi's built-in async FFI calls instead of worker threads.
 * Each async call runs on a lightweight koffi thread — no V8 isolate overhead.
 */
class ModuleClient {
    private readonly customPath: boolean;
    private readonly tlsDependency: TlsDependency;
    private readonly tlsDependencyPath: ReturnType<TlsDependency['getTLSDependencyPath']> | undefined;
    private readonly TLS_LIB_PATH: string;

    private lib: ReturnType<typeof koffi.load> | null = null;
    private fns: Record<string, KoffiAsyncFn> | null = null;

    /**
     * @description Creates a new ModuleClient instance.
     * @param {ModuleClientOptions} [options] - Configuration options for the ModuleClient
     * @example const module = new ModuleClient();
     * @example const module = new ModuleClient({ customLibraryPath: '/path/to/tls-library' });
     */
    constructor(options?: ModuleClientOptions) {
        this.customPath = options?.customLibraryPath ? true : false;
        this.tlsDependency = new TlsDependency();
        this.tlsDependencyPath = this.tlsDependency.getTLSDependencyPath(options?.customLibraryDownloadPath);
        const libPath = this.customPath ? options?.customLibraryPath : this.tlsDependencyPath?.TLS_LIB_PATH;
        if (!libPath) {
            throw new Error('TLS library path not available');
        }
        this.TLS_LIB_PATH = libPath;
    }

    /**
     * Whether the module is loaded and ready for calls.
     */
    get isOpen(): boolean {
        return this.lib !== null && this.fns !== null;
    }

    /**
     * @description Checks if the TLS library exists.
     * @returns {boolean} True if the library exists, false otherwise.
     */
    private libraryExists(): boolean {
        return fs.existsSync(path.join(this.TLS_LIB_PATH));
    }

    /**
     * @description Downloads the TLS library if it does not exist.
     * @returns {Promise<void>} Promise that resolves when the library is downloaded
     */
    private async downloadLibrary(): Promise<void> {
        if (this.libraryExists()) return;

        if (this.customPath) {
            throw new Error('Custom path provided but library does not exist: ' + this.TLS_LIB_PATH);
        }

        console.log('[tlsClient] Detected missing TLS library');
        console.log('[tlsClient] DownloadPath: ' + this.tlsDependencyPath?.DOWNLOAD_PATH);
        console.log('[tlsClient] DestinationPath: ' + this.TLS_LIB_PATH);
        console.log('[tlsClient] Downloading TLS library... This may take a while');

        const downloadPath = this.tlsDependencyPath?.DOWNLOAD_PATH;
        if (!downloadPath) {
            throw new Error('Download path not available');
        }

        const response = await fetch(downloadPath);
        if (!response.ok) {
            throw new Error(`Unexpected response ${response.statusText}`);
        }
        await writeFile(this.TLS_LIB_PATH, Buffer.from(await response.arrayBuffer()));
        console.log('[tlsClient] Successfully downloaded TLS library');
    }

    /**
     * @description Loads the TLS library and creates FFI bindings.
     * @returns {Promise<void>} Promise that resolves when the library is ready
     */
    async open(): Promise<void> {
        if (this.lib) return;

        await this.downloadLibrary();

        this.lib = koffi.load(this.TLS_LIB_PATH);
        this.fns = {
            request: this.lib.func('request', 'string', ['string']) as KoffiAsyncFn,
            getCookiesFromSession: this.lib.func('getCookiesFromSession', 'string', ['string']) as KoffiAsyncFn,
            addCookiesToSession: this.lib.func('addCookiesToSession', 'string', ['string']) as KoffiAsyncFn,
            freeMemory: this.lib.func('freeMemory', 'void', ['string']) as KoffiAsyncFn,
            destroyAll: this.lib.func('destroyAll', 'string', []) as KoffiAsyncFn,
            destroySession: this.lib.func('destroySession', 'string', ['string']) as KoffiAsyncFn,
        };
    }

    /**
     * Dispatch an FFI call asynchronously via koffi's built-in thread pool.
     *
     * Response strings that look like JSON are parsed automatically and
     * `freeMemory` is called on the Go-allocated response id.
     */
    async call(fn: string, args: unknown[]): Promise<unknown> {
        if (!this.fns) {
            throw new Error('Module not initialized. Call open() first.');
        }

        const func = this.fns[fn];
        if (typeof func !== 'function') {
            throw new Error(`Unknown function: ${fn}`);
        }

        const fns = this.fns;

        return await new Promise((resolve, reject) => {
            const callback = (err: Error | null, result: unknown): void => {
                if (err) {
                    reject(err);
                    return;
                }

                if (typeof result === 'string' && result.trim().startsWith('{')) {
                    try {
                        const parsed = JSON.parse(result) as { id?: string };

                        if (parsed.id) {
                            const freeMemory = fns['freeMemory'];
                            if (typeof freeMemory === 'function') {
                                (freeMemory as (id: string) => void)(parsed.id);
                            }
                            delete parsed.id;
                        }

                        resolve(parsed);
                    } catch {
                        resolve(result);
                    }
                } else {
                    resolve(result);
                }
            };

            func.async(...args, callback);
        });
    }

    /**
     * @description Destroys all Go-side sessions and releases FFI bindings.
     * The native library is NOT unloaded (Go runtime cannot safely be dlclose'd).
     * @returns {Promise<boolean>} True if the termination was successful, false otherwise.
     */
    async terminate(): Promise<boolean> {
        try {
            if (this.fns) {
                await this.call('destroyAll', []);
                this.fns = null;
            }
            this.lib = null;
            return true;
        } catch (error) {
            console.error('Error during ModuleClient termination:', error);
            return false;
        }
    }
}

export default ModuleClient;
