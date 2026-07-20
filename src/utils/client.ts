import Piscina from 'piscina';
import TlsDependency from './path.js';
import path from 'node:path';
import fs from 'node:fs';
import { rename, writeFile } from 'node:fs/promises';
import os from 'node:os';
import { isMainThread } from 'node:worker_threads';

/** Relies on the bundled dist layout (dist/index.* next to dist/utils/worker.*) and tsup's __dirname shim. */
function getWorkerPath(): string {
    const ext = typeof __dirname !== 'undefined' && __filename.endsWith('.cjs') ? 'cjs' : 'mjs';
    return path.resolve(__dirname, 'utils', `worker.${ext}`);
}

/**
 * Configuration options for the ModuleClient
 */
export interface ModuleClientOptions {
    /** Path to a custom TLS library */
    customLibraryPath?: string;
    /** Path to download the TLS library */
    customLibraryDownloadPath?: string;
    /** Maximum number of threads in the worker pool */
    maxThreads?: number;
}

/**
 * Statistics about the worker pool
 */
export interface PoolStats {
    /** Worker utilization of the pool as a ratio between 0 and 1 */
    utilization: number;
    /** The number of completed tasks */
    completed: number;
    /** The number of tasks waiting to be processed */
    waiting: number;
    /** The number of threads in the pool */
    threads: number;
}

/**
 * @classdesc Manages the TLS library and worker pool.
 */
class ModuleClient {
    private readonly customPath: boolean;
    private readonly tlsDependency: TlsDependency;
    private readonly tlsDependencyPath: ReturnType<TlsDependency['getTLSDependencyPath']> | undefined;
    private readonly TLS_LIB_PATH: string;
    private readonly maxThreads: number;

    public pool: Piscina | null = null;
    private opening: Promise<void> | null = null;

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
        this.maxThreads = options?.maxThreads ?? Math.max(os.cpus().length, 1) * 2;
    }

    /**
     * @description Checks if the TLS library exists.
     * @returns {boolean} True if the library exists, false otherwise.
     */
    private libraryExists(): boolean {
        return fs.existsSync(this.TLS_LIB_PATH);
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

        const downloadPath = this.tlsDependencyPath?.DOWNLOAD_PATH;
        if (!downloadPath) {
            throw new Error('Download path not available');
        }

        console.log('[tlsClient] Detected missing TLS library');
        console.log('[tlsClient] DownloadPath: ' + downloadPath);
        console.log('[tlsClient] DestinationPath: ' + this.TLS_LIB_PATH);
        console.log('[tlsClient] Downloading TLS library... This may take a while');

        const response = await fetch(downloadPath);
        if (!response.ok) {
            throw new Error(`Unexpected response ${response.statusText}`);
        }

        // Write to a temp file and rename so an interrupted download never leaves a truncated library
        const tempPath = `${this.TLS_LIB_PATH}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`;
        await writeFile(tempPath, Buffer.from(await response.arrayBuffer()));
        await rename(tempPath, this.TLS_LIB_PATH);
        console.log('[tlsClient] Successfully downloaded TLS library');
    }

    /**
     * @description Opens the TLS library and initializes the worker pool.
     * @returns {Promise<void>} Promise that resolves when the library is opened and pool is initialized
     */
    async open(): Promise<void> {
        // Memoize the in-flight initialization so concurrent callers share one pool
        this.opening ??= this.initialize();
        try {
            await this.opening;
        } catch (error) {
            this.opening = null;
            throw error;
        }
    }

    private async initialize(): Promise<void> {
        if (isMainThread) {
            await this.downloadLibrary();
        }

        this.pool = this.startWorkerPool();
    }

    /**
     * @description Starts the worker pool.
     * @returns {Piscina} The Piscina worker pool.
     */
    private startWorkerPool(): Piscina {
        return new Piscina({
            filename: getWorkerPath(),
            workerData: { libraryPath: this.TLS_LIB_PATH },
            atomics: 'disabled',
            idleTimeout: 30000,
            minThreads: 1,
            maxThreads: this.maxThreads,
        });
    }

    /**
     * @description Get current pool statistics.
     * @returns {PoolStats | null} Pool statistics.
     */
    getPoolStats(): PoolStats | null {
        if (!this.pool) return null;

        return {
            utilization: this.pool.utilization,
            completed: this.pool.completed,
            waiting: this.pool.queueSize,
            threads: this.pool.threads.length,
        };
    }

    /**
     * @description Terminates the worker pool and unloads the TLS library.
     * @returns {Promise<boolean>} True if the termination was successful, false otherwise.
     */
    async terminate(): Promise<boolean> {
        // Wait for an in-flight open() so a pending initialization cannot resurrect the pool
        if (this.opening) {
            await this.opening.catch(() => undefined);
        }

        const pool = this.pool;
        this.pool = null;
        this.opening = null;
        if (!pool) return true;

        try {
            await pool.run({ fn: 'destroyAll', args: [] });
            await pool.destroy();
            return true;
        } catch (error) {
            console.error('Error during ModuleClient termination:', error);
            return false;
        }
    }
}

export default ModuleClient;
