import koffi from 'koffi';
import { workerData } from 'worker_threads';

// Create a single instance per worker
let lib = null;
let instance = null;

function createInstance() {
    if (!lib) {
        lib = koffi.load(workerData.libraryPath);
    }
    return {
        request: lib.func('request', 'string', ['string']),
        getCookiesFromSession: lib.func('getCookiesFromSession', 'string', ['string']),
        addCookiesToSession: lib.func('addCookiesToSession', 'string', ['string']),
        freeMemory: lib.func('freeMemory', 'void', ['string']),
        destroyAll: lib.func('destroyAll', 'string', []),
        destroySession: lib.func('destroySession', 'string', ['string']),
        unloadLibrary: koffi.unload,
    };
}

// Initialize instance on worker startup
instance = createInstance();

export default async function handler({ fn, args = {} }) {
    const result = JSON.parse(await instance[fn](...args));

    // Free memory immediately if needed
    if (result.id) {
        await instance.freeMemory(result.id);
        delete result.id;
    }

    return result;
}
