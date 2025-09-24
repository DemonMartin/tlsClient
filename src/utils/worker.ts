import koffi from 'koffi';
import { workerData } from 'worker_threads';

interface WorkerTask {
    fn: string;
    args?: unknown[];
}

// Create a single instance per worker
let lib: koffi.IKoffiLib | null = null;
let instance: Record<string, unknown> | null = null;

function createInstance(): Record<string, unknown> {
    const data = workerData as { libraryPath: string };

    lib ??= koffi.load(data.libraryPath);

    return {
        request: lib.func('request', 'string', ['string']),
        getCookiesFromSession: lib.func('getCookiesFromSession', 'string', ['string']),
        addCookiesToSession: lib.func('addCookiesToSession', 'string', ['string']),
        freeMemory: lib.func('freeMemory', 'void', ['string']),
        destroyAll: lib.func('destroyAll', 'string', []),
        destroySession: lib.func('destroySession', 'string', ['string']),
    };
}

// Initialize instance on worker startup
instance = createInstance();

export default async function handler(task: WorkerTask): Promise<unknown> {
    if (!instance) {
        throw new Error('Worker instance not initialized');
    }

    const { fn, args = [] } = task;

    // Type guard to ensure the function exists
    if (!(fn in instance)) {
        throw new Error(`Unknown function: ${fn}`);
    }

    const func = instance[fn];

    if (typeof func !== 'function') {
        throw new Error(`${fn} is not a function`);
    }

    const result = await (func as (...args: unknown[]) => unknown)(...args);

    // Parse result if it's a string (most functions return JSON strings)
    if (typeof result === 'string' && result.trim().startsWith('{')) {
        const parsedResult = JSON.parse(result) as { id?: string };

        // Free memory immediately if needed
        if (parsedResult.id && 'freeMemory' in instance && typeof instance.freeMemory === 'function') {
            await (instance.freeMemory as (id: string) => void)(parsedResult.id);
            delete parsedResult.id;
        }

        return parsedResult;
    }

    return result;
}
