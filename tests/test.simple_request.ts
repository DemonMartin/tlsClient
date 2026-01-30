import { ModuleClient, SessionClient } from '../dist/index.mjs';
import { performance } from 'node:perf_hooks';

const moduleClient = new ModuleClient();
const sessionClient = new SessionClient(moduleClient);

async function runLoadTest(): Promise<void> {
    const totalRequests = 25000;
    const concurrency = 100;
    const url = 'https://example.com';

    let started = 0;
    let completed = 0;
    let sumMs = 0;
    let maxMs = 0;

    const testStart = performance.now();

    const runner = async () => {
        while (true) {
            const index = started++;
            if (index >= totalRequests) return;

            const requestStart = performance.now();
            await sessionClient.get(url);
            const duration = performance.now() - requestStart;

            sumMs += duration;
            if (duration > maxMs) maxMs = duration;

            completed++;
            if (completed % 1000 === 0) {
                const m = process.memoryUsage();
                const s = moduleClient.getPoolStats?.();
                console.log(
                    JSON.stringify({
                        completed,
                        inFlight: started - completed,
                        avgMs: Math.round(sumMs / completed),
                        maxMs: Math.round(maxMs),
                        rssMB: Math.round(m.rss / 1e6),
                        heapUsedMB: Math.round(m.heapUsed / 1e6),
                        externalMB: Math.round(m.external / 1e6),
                        waiting: s?.waiting,
                        threads: s?.threads,
                        util: s?.utilization,
                    }),
                );
            }
        }
    };

    await Promise.all(Array.from({ length: concurrency }, runner));

    const totalMs = performance.now() - testStart;
    console.log(
        JSON.stringify({
            total: totalRequests,
            concurrency,
            totalSec: Math.round(totalMs / 1000),
            avgMs: Math.round(sumMs / completed),
            maxMs: Math.round(maxMs),
        }),
    );
}

if (process.env.LOAD_TEST === '1' || true) {
    await runLoadTest();
} else {
    const response = await sessionClient.get('https://example.com');
    console.log(response);
}

await sessionClient.destroySession();
await moduleClient.terminate();
