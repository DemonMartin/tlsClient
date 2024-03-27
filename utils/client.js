import ffiRs from 'ffi-rs';
import workerpool from 'workerpool';
import TlsDependency from './path.js';
import path from 'node:path';
import fs from 'node:fs';
import axios from 'axios';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Client {

    // static workerpool = workerpool.pool(path.join(__dirname, 'client.js'), {
    // });

    constructor(customPath = null) {
        this.tlsDependency = new TlsDependency();
        this.tlsDependencyPath = this.tlsDependency.getTLSDependencyPath();
        this.TLS_LIB_PATH = customPath ?? this.tlsDependencyPath?.TLS_LIB_PATH;
        this.customPath = customPath ? true : false;
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

        const response = await axios({
            url: this.tlsDependencyPath.DOWNLOAD_PATH,
            method: 'GET',
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(this.TLS_LIB_PATH);

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log('[tlsClient] Successfully downloaded TLS library');
                resolve();
            });
            writer.on('error', reject);
        });
    }

    async open() {
        await this.downloadLibrary();

        ffiRs.open({
            library: 'tls',
            path: this.TLS_LIB_PATH,
        })
    }

    createInstance() {
        return {
            request: (payload) => {
                return ffiRs.load({
                    library: 'tls',
                    funcName: 'request',
                    retType: 0,
                    paramsType: [0],
                    paramsValue: [payload]
                })
            },
            getCookiesFromSession: (payload) => {
                return ffiRs.load({
                    library: 'tls',
                    funcName: 'getCookiesFromSession',
                    retType: 0,
                    paramsType: [0],
                    paramsValue: [payload]
                })
            },
            addCookiesToSession: (payload) => {
                return ffiRs.load({
                    library: 'tls',
                    funcName: 'addCookiesToSession',
                    retType: 0,
                    paramsType: [0],
                    paramsValue: [payload]
                })
            },
            freeMemory: (payload) => {
                return ffiRs.load({
                    library: 'tls',
                    funcName: 'freeMemory',
                    retType: 2,
                    paramsType: [0],
                    paramsValue: [payload]
                })
            },
            destroyAll: () => {
                return ffiRs.load({
                    library: 'tls',
                    funcName: 'destroyAll',
                    retType: 0,
                    paramsType: [],
                    paramsValue: []
                })
            },
            destroySession: (payload) => {
                return ffiRs.load({
                    library: 'tls',
                    funcName: 'destroySession',
                    retType: 0,
                    paramsType: [0],
                    paramsValue: [payload]
                })
            },
        }
    }

    startWorker() {
        const instance = this.createInstance();

        workerpool.worker({
            request: instance.request,
            getCookiesFromSession: instance.getCookiesFromSession,
            addCookiesToSession: instance.addCookiesToSession,
            freeMemory: instance.freeMemory,
            destroyAll: instance.destroyAll,
            destroySession: instance.destroySession,
        });
    }

    startWorkerPool() {
        return workerpool.pool(path.join(__dirname, 'client.js'), {
        });
    }
}

export default Client;

// For the workerpool to work, you need to run the following code
if (!workerpool.isMainThread) {
    const client = new Client();
    client.startWorker();
}
