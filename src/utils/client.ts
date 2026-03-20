import koffi from 'koffi';
import TlsDependency from './path.js';
import path from 'node:path';
import fs from 'node:fs';
import { writeFile } from 'node:fs/promises';

const KOFFI_MAX_ASYNC = 4096;
const CONCURRENCY_LIMIT = KOFFI_MAX_ASYNC - 64;

/**
 * Configuration options for the ModuleClient
 */
export interface ModuleClientOptions {
    /** Path to a custom TLS library */
    customLibraryPath?: string;
    /** Path to download the TLS library */
    customLibraryDownloadPath?: string;
}

type KoffiAsyncCallback = (err: Error | null, result: unknown) => void;

interface KoffiAsyncFn {
    (arg: string): unknown;
    async(arg: string, cb: KoffiAsyncCallback): void;
    async(cb: KoffiAsyncCallback): void;
}

export interface TlsFunctions {
    request: KoffiAsyncFn;
    getCookiesFromSession: KoffiAsyncFn;
    addCookiesToSession: KoffiAsyncFn;
    freeMemory: KoffiAsyncFn;
    destroyAll: KoffiAsyncFn;
    destroySession: KoffiAsyncFn;
}

interface GoJsonResponse {
    id?: string;
    [key: string]: unknown;
}

/**
 * @classdesc Manages the TLS library and async FFI bindings via koffi.
 * No worker threads — each async call runs on a lightweight koffi OS thread.
 * A lightweight semaphore transparently queues overflow when concurrency exceeds
 * koffi's 4096 async call limit, so callers never see a crash.
 */
class ModuleClient {
    private readonly TLS_LIB_PATH: string;
    private readonly downloadPath: string | undefined;

    private lib: ReturnType<typeof koffi.load> | null = null;
    private fns: TlsFunctions | null = null;

    private inflight = 0;
    private readonly waitQueue: (() => void)[] = [];

    /**
     * @description Creates a new ModuleClient instance.
     * @param {ModuleClientOptions} [options] - Configuration options for the ModuleClient
     * @example const module = new ModuleClient();
     * @example const module = new ModuleClient({ customLibraryPath: '/path/to/tls-library' });
     * @example const module = new ModuleClient({ customLibraryDownloadPath: '/path/to/folder' });
     */
    constructor(options?: ModuleClientOptions) {
        if (options?.customLibraryPath) {
            this.TLS_LIB_PATH = options.customLibraryPath;
            this.downloadPath = undefined;
        } else {
            const dep = new TlsDependency();
            const paths = dep.getTLSDependencyPath(options?.customLibraryDownloadPath);
            if (!paths?.TLS_LIB_PATH) {
                throw new Error('TLS library path not available');
            }
            this.TLS_LIB_PATH = paths.TLS_LIB_PATH;
            this.downloadPath = paths.DOWNLOAD_PATH;
        }
    }

    /**
     * @description Whether the module is loaded and ready for calls.
     */
    get isOpen(): boolean {
        return this.fns !== null;
    }

    private async ensureLibrary(): Promise<void> {
        if (fs.existsSync(path.join(this.TLS_LIB_PATH))) return;

        if (!this.downloadPath) {
            throw new Error('Library does not exist: ' + this.TLS_LIB_PATH);
        }

        console.log('[tlsClient] Downloading TLS library to ' + this.TLS_LIB_PATH);

        const response = await fetch(this.downloadPath);
        if (!response.ok) {
            throw new Error(`Unexpected response ${response.statusText}`);
        }
        await writeFile(this.TLS_LIB_PATH, Buffer.from(await response.arrayBuffer()));
        console.log('[tlsClient] Successfully downloaded TLS library');
    }

    /**
     * @description Loads the TLS library and creates FFI bindings.
     * Downloads the library automatically if it does not exist.
     * @returns {Promise<void>} Promise that resolves when the library is ready
     */
    async open(): Promise<void> {
        if (this.fns) return;

        await this.ensureLibrary();
        koffi.config({ max_async_calls: KOFFI_MAX_ASYNC });

        this.lib = koffi.load(this.TLS_LIB_PATH);
        this.fns = {
            request: this.lib.func('request', 'string', ['string']) as unknown as KoffiAsyncFn,
            getCookiesFromSession: this.lib.func('getCookiesFromSession', 'string', [
                'string',
            ]) as unknown as KoffiAsyncFn,
            addCookiesToSession: this.lib.func('addCookiesToSession', 'string', ['string']) as unknown as KoffiAsyncFn,
            freeMemory: this.lib.func('freeMemory', 'void', ['string']) as unknown as KoffiAsyncFn,
            destroyAll: this.lib.func('destroyAll', 'string', []) as unknown as KoffiAsyncFn,
            destroySession: this.lib.func('destroySession', 'string', ['string']) as unknown as KoffiAsyncFn,
        };
    }

    private async acquireSlot(): Promise<void> {
        if (this.inflight < CONCURRENCY_LIMIT) {
            this.inflight++;
            return;
        }
        await new Promise<void>((resolve) => this.waitQueue.push(resolve));
        this.inflight++;
    }

    private releaseSlot(): void {
        this.inflight--;
        const next = this.waitQueue.shift();
        if (next) next();
    }

    private invokeAsync(func: KoffiAsyncFn, arg?: string): Promise<unknown> {
        return new Promise((resolve, reject) => {
            const cb: KoffiAsyncCallback = (err, result) => {
                if (err) reject(err);
                else resolve(result);
            };

            if (arg !== undefined) {
                func.async(arg, cb);
            } else {
                func.async(cb);
            }
        });
    }

    private parseResponse(raw: unknown): unknown {
        if (typeof raw !== 'string' || !raw.trim().startsWith('{')) return raw;

        let parsed: GoJsonResponse;
        try {
            parsed = JSON.parse(raw) as GoJsonResponse;
        } catch {
            return raw;
        }

        if (parsed.id) {
            this.fns?.freeMemory(parsed.id);
            delete parsed.id;
        }

        return parsed;
    }

    /**
     * Dispatch an async FFI call. Concurrency is transparently capped below
     * koffi's 4096 limit; overflow callers wait in a FIFO queue.
     * JSON responses are parsed automatically and Go memory is freed.
     */
    async call(fn: keyof TlsFunctions, args: string[]): Promise<unknown> {
        if (!this.fns) {
            throw new Error('Module not initialized. Call open() first.');
        }

        const func = this.fns[fn];

        await this.acquireSlot();
        try {
            const raw = await this.invokeAsync(func, args[0]);
            return this.parseResponse(raw);
        } finally {
            this.releaseSlot();
        }
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
