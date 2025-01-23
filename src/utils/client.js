import koffi from 'koffi';
import Piscina from 'piscina';
import TlsDependency from './path.js';
import path from 'node:path';
import fs from 'node:fs';
import fetch from 'node-fetch';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import { isMainThread } from 'worker_threads';

let __filename, __dirname;

if (typeof __filename === 'undefined' && typeof __dirname === 'undefined') {
    if (typeof require !== 'undefined' && require.main) {
        // CommonJS environment
        __filename = __filename || __filename;
        __dirname = __dirname || path.dirname(__filename);
    } else if (typeof import.meta.url !== 'undefined') {
        // ESM environment
        __filename = fileURLToPath(import.meta.url);
        __dirname = path.dirname(__filename);
    } else {
        throw new Error('Failed setting __filename and __dirname... Please report this to the Developer.');
    }
}

/**
 * @class ModuleClient
 * @classdesc Manages the TLS library and worker pool.
 */
class ModuleClient {
    /**
     * @constructor
     * @param {Object} [options] - Configuration options for the ModuleClient.
     * @param {string} [options.customLibraryPath] - Path to a custom TLS library.
     * @param {string} [options.customLibraryDownloadPath] - Path to download the TLS library.
     * @param {string} [options.maxThreads] - Maximum number of threads in the worker pool.
     * @description Creates a new ModuleClient instance.
     * @example const module = new ModuleClient();
     * @example const module = new ModuleClient({ customLibraryPath: '/path/to/tls-library' });
     */
    constructor(options) {
        /** @private */
        this.customPath = options?.customLibraryPath ? true : false;
        /** @private */
        this.tlsDependency = new TlsDependency();
        /** @private */
        this.tlsDependencyPath = this.tlsDependency.getTLSDependencyPath(options?.customLibraryDownloadPath);
        /** @private */
        this.TLS_LIB_PATH = this.customPath ? options?.customLibraryPath : this.tlsDependencyPath?.TLS_LIB_PATH;
        /** @private */
        this.pool = null;
        /** @private */
        this.maxThreads = options?.maxThreads ?? Math.max(os?.cpus()?.length ?? 12) * 2;
    }

    /**
     * @private
     * @description Checks if the TLS library exists.
     * @returns {boolean} True if the library exists, false otherwise.
     */
    libraryExists() {
        return fs.existsSync(path.join(this.TLS_LIB_PATH));
    }

    /**
     * @private
     * @description Downloads the TLS library if it does not exist.
     * @returns {Promise<void>}
     */
    async downloadLibrary() {
        if (this.libraryExists()) return;
        if (this.customPath) {
            throw new Error('Custom path provided but library does not exist: ' + this.TLS_LIB_PATH);
        }
        console.log('[tlsClient] Detected missing TLS library');
        console.log('[tlsClient] DownloadPath: ' + this.tlsDependencyPath.DOWNLOAD_PATH);
        console.log('[tlsClient] DestinationPath: ' + this.TLS_LIB_PATH);
        console.log('[tlsClient] Downloading TLS library... This may take a while');

        const response = await fetch(this.tlsDependencyPath.DOWNLOAD_PATH);
        if (!response.ok) {
            throw new Error(`Unexpected response ${response.statusText}`);
        }
        const fileStream = fs.createWriteStream(this.TLS_LIB_PATH);
        response.body.pipe(fileStream);

        return new Promise((resolve, reject) => {
            fileStream.on('finish', () => {
                console.log('[tlsClient] Successfully downloaded TLS library');
                resolve();
            });
            fileStream.on('error', reject);
        });
    }

    /**
     * @private
     * @description Opens the TLS library and initializes the worker pool.
     * @returns {Promise<void>}
     */
    async open() {
        if (this.pool) return; // Prevent repeated initializations
        if (isMainThread) {
            await this.downloadLibrary();
        }
        this.pool = this.startWorkerPool();
    }

    /**
     * @private
     * @description Starts the worker pool.
     * @returns {Piscina} The Piscina worker pool.
     */
    startWorkerPool() {
        return new Piscina({
            filename: path.join(__dirname, 'worker.js'),
            workerData: { libraryPath: this.TLS_LIB_PATH },
            maxQueue: Infinity,
            atomics: 'disabled',
            idleTimeout: 30000,
            minThreads: 1,
            maxThreads: this.maxThreads,
        });
    }

    /**
     * @typedef {Object} PoolStats
     * @property {number} utilization - The number of active threads in the pool.
     * @property {number} completed - The number of completed tasks.
     * @property {number} waiting - The number of tasks waiting to be processed.
     * @property {number} threads - The number of threads in the pool
     */

    /**
     * @description Get current pool statistics.
     * @returns {PoolStats|void} Pool statistics.
     */
    getPoolStats() {
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
     * @returns {Promise<Boolean>} True if the termination was successful, false otherwise.
     */
    async terminate() {
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
