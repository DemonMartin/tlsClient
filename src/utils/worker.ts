import koffi, { type KoffiFunc } from 'koffi';
import { workerData } from 'node:worker_threads';

interface WorkerTask {
    fn: string;
    args?: string[];
}

type TlsClientFunction = KoffiFunc<(...args: string[]) => string>;

// One library instance per worker thread
const lib = koffi.load((workerData as { libraryPath: string }).libraryPath);

const freeMemory: TlsClientFunction = lib.func('freeMemory', 'void', ['string']);

// freeMemory is intentionally not dispatchable by name; the handler frees responses itself
const functions: Record<string, TlsClientFunction> = {
    request: lib.func('request', 'string', ['string']),
    getCookiesFromSession: lib.func('getCookiesFromSession', 'string', ['string']),
    addCookiesToSession: lib.func('addCookiesToSession', 'string', ['string']),
    destroyAll: lib.func('destroyAll', 'string', []),
    destroySession: lib.func('destroySession', 'string', ['string']),
};

export default function handler(task: WorkerTask): unknown {
    const { fn, args = [] } = task;
    const func = functions[fn];

    if (!func) {
        throw new Error(`Unknown function: ${fn}`);
    }

    const result = func(...args);

    // Parse result if it's a string (most functions return JSON strings)
    if (typeof result === 'string' && result.trim().startsWith('{')) {
        const parsedResult = JSON.parse(result) as { id?: string };

        // The Go side allocates each response; free it via its id
        if (parsedResult.id) {
            freeMemory(parsedResult.id);
            delete parsedResult.id;
        }

        return parsedResult;
    }

    return result;
}
