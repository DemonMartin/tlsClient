import Piscina from 'piscina';
import TlsDependency from './path.js';
import path from 'node:path';
import fs from 'node:fs';
import fetch from 'node-fetch';
import os from 'node:os';
import { isMainThread } from 'worker_threads';
import { fileURLToPath } from 'node:url';

// Remove unused variables

// Get worker file path for current environment
function getWorkerPath(): string {
    // Try standard resolution first
    try {
        return require.resolve('./worker.js');
    } catch {
        // Manual resolution - worker is in utils/ subdirectory
        const isESM = typeof __dirname === 'undefined';
        const workerFile = isESM ? 'worker.mjs' : 'worker.cjs';

        if (isESM && import.meta?.url) {
            // ESM: same directory as current file
            const currentDir = path.dirname(fileURLToPath(import.meta.url));
            return path.resolve(currentDir, workerFile);
        } else if (!isESM) {
            // CJS: same directory as current file
            return path.resolve(__dirname, workerFile);
        } else {
            // Fallback: assume utils subdirectory in dist
            return path.resolve(path.dirname(process.argv[1] ?? ''), 'utils', workerFile);
        }
    }
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
    /** The number of active threads in the pool */
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
        this.maxThreads = options?.maxThreads ?? Math.max(os.cpus()?.length ?? 12, 1) * 2;
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

        const fileStream = fs.createWriteStream(this.TLS_LIB_PATH);
        response.body?.pipe(fileStream);

        return new Promise<void>((resolve, reject) => {
            fileStream.on('finish', () => {
                console.log('[tlsClient] Successfully downloaded TLS library');
                resolve();
            });
            fileStream.on('error', reject);
        });
    }

    /**
     * @description Opens the TLS library and initializes the worker pool.
     * @returns {Promise<void>} Promise that resolves when the library is opened and pool is initialized
     */
    async open(): Promise<void> {
        if (this.pool) return; // Prevent repeated initializations

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
            maxQueue: Infinity,
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
        try {
            if (this.pool) {
                await this.pool.run({ fn: 'destroyAll', args: [] });
                await this.pool.destroy();
                this.pool = null;
            }

            return true;
        } catch (error) {
            console.error('Error during ModuleClient termination:', error);
            return false;
        }
    }
}

export default ModuleClient;
