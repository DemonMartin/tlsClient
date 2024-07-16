import koffi from 'koffi';
import workerpool from 'workerpool';
import TlsDependency from './path.js';
import path from 'node:path';
import fs from 'node:fs';
import fetch from 'node-fetch';
import { fileURLToPath } from 'node:url';

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

class Client {

    // static workerpool = workerpool.pool(path.join(__dirname, 'client.js'), {
    // });

    constructor(options) {
        this.customPath = options?.customLibraryPath ? true : false;
        this.tlsDependency = new TlsDependency();
        this.tlsDependencyPath = this.tlsDependency.getTLSDependencyPath(options?.customLibraryDownloadPath);
        this.TLS_LIB_PATH = this.customPath ? options?.customLibraryPath : this.tlsDependencyPath?.TLS_LIB_PATH;

        this.lib = null;
    }

    libraryExists() {
        return fs.existsSync(path.join(this.TLS_LIB_PATH));
    }

    async downloadLibrary() {
        if (this.libraryExists()) return;
        if (this.customPath) {
            throw new Error('Custom path provided but library does not exist: ' + this.TLS_LIB_PATH);
        }

        console.log('[tlsClient] Detected missing TLS library')
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
        await this.downloadLibrary();

        this.lib = koffi.load(this.TLS_LIB_PATH);
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
            destroyAll: this.lib.func('destroyAll', 'void', []),
            destroySession: this.lib.func('destroySession', 'string', ['string']),
        }
    }

    startWorker() {
        const instance = this.createInstance();

        workerpool.worker(instance);
    }

    startWorkerPool() {
        return workerpool.pool(path.join(__dirname, 'client.js'), {
        })
    }
}

export default Client;

// For the workerpool to work, you need to run the following code
if (!workerpool.isMainThread) {
    const client = new Client();
    await client.open();
    client.startWorker();
}
