import koffi from 'koffi';
import workerpool from 'workerpool';
import TlsDependency from './path.js';
import path from 'node:path';
import fs from 'node:fs';
import fetch from 'node-fetch';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

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

class ModuleClient {
    constructor(options) {
        this.customPath = options?.customLibraryPath ? true : false;
        this.tlsDependency = new TlsDependency();
        this.tlsDependencyPath = this.tlsDependency.getTLSDependencyPath(options?.customLibraryDownloadPath);
        this.TLS_LIB_PATH = this.customPath ? options?.customLibraryPath : this.tlsDependencyPath?.TLS_LIB_PATH;
        this.lib = null;
        this.pool = null;
    }

    libraryExists() {
        return fs.existsSync(path.join(this.TLS_LIB_PATH));
    }

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

    async open() {
        if (this.pool) return; // Prevent repeated initializations
        if (workerpool.isMainThread) {
            await this.downloadLibrary();
        }
        this.lib = koffi.load(this.TLS_LIB_PATH);
        this.pool = this.startWorkerPool();
    }

    createInstance() {
        if (!this.lib) {
            throw new Error('Library not loaded');
        }
        return {
            request: this.lib.func('request', 'string', ['string']),
            getCookiesFromSession: this.lib.func('getCookiesFromSession', 'string', ['string']),
            addCookiesToSession: this.lib.func('addCookiesToSession', 'string', ['string']),
            freeMemory: this.lib.func('freeMemory', 'void', ['string']),
            destroyAll: this.lib.func('destroyAll', 'string', []),
            destroySession: this.lib.func('destroySession', 'string', ['string']),
        };
    }

    startWorker() {
        const instance = this.createInstance();
        workerpool.worker(instance);
    }

    startWorkerPool() {
        return workerpool.pool(path.join(__dirname, 'client.js'), {
            workerThreadOpts: {
                argv: [this.TLS_LIB_PATH],
                resourceLimits: {
                    maxOldGenerationSizeMb: 128,
                    maxYoungGenerationSizeMb: 128,
                    stackSizeMb: 4,
                },
            },
            workerType: 'thread',
            onCreateWorker: () => {
                console.log('[tlsClient] Worker created, current pool size:', this.pool?.stats()?.totalWorkers ?? 0);
            },
            onTerminateWorker: () => {
                console.log('[tlsClient] Worker terminated, current pool size:', this.pool?.stats()?.totalWorkers ?? 0);
            },
        });
    }

    /**
     * @description Get current pool statistics
     * @returns {Object} Pool statistics
     */
    getPoolStats() {
        return this.pool?.stats();
    }

    async terminate() {
        try {
            if (this.pool) {
                await this.pool.exec('destroyAll', []); // Clean up all sessions first
                await this.pool.terminate(true); // Force terminate all workers
                this.pool = null;
            }
            if (this.lib) {
                this.lib.unload();
                this.lib = null;
            }
        } catch (error) {
            console.error('Error during ModuleClient termination:', error);
        }
    }
}

// For the workerpool to work, you need to run the following code
if (!workerpool.isMainThread && process.argv.length > 2) {
    while (!fs.existsSync(process.argv[2])) {
        setTimeout(() => {}, 100);
    }
    const moduleClient = new ModuleClient({
        customLibraryPath: process.argv[2],
    });
    await moduleClient.open();
    moduleClient.startWorker();
}

export default ModuleClient;
