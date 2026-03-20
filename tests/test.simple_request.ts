import { ModuleClient, SessionClient } from '../dist/index.mjs';
import { createServer, type Server } from 'node:http';
import { performance } from 'node:perf_hooks';

const PORT = 3456;
/** Use loopback explicitly so the client and server always match. */
const url = `http://127.0.0.1:${PORT}`;

function startServer(): Promise<Server> {
    return new Promise((resolve, reject) => {
        const server = createServer((_, res) => {
            // Default HTTP/1.1 keep-alive — do NOT send Connection: close here; that would
            // force a new TCP connection per request and tank req/s. Shutdown uses
            // closeAllConnections() instead.
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('ok');
        });
        server.listen(PORT, '127.0.0.1', () => resolve(server));
        server.on('error', reject);
    });
}

/** Stops accepting connections, tears down open sockets, then resolves when the server is fully closed. */
function stopServer(server: Server): Promise<void> {
    return new Promise((resolve, reject) => {
        server.close((err) => {
            if (err) reject(err);
            else resolve();
        });
        // Without this, keep-alive / Go-side idle conns can leave close() pending forever.
        server.closeAllConnections?.();
    });
}

const moduleClient = new ModuleClient();

async function runAtConcurrency(
    session: SessionClient,
    concurrency: number,
    totalRequests: number,
): Promise<{ concurrency: number; rps: number; avgMs: number; maxMs: number; p99Ms: number; rssMB: number }> {
    let started = 0;
    let completed = 0;
    const latencies: number[] = [];

    const testStart = performance.now();

    const runner = async () => {
        while (true) {
            const index = started++;
            if (index >= totalRequests) return;

            const t0 = performance.now();
            await session.get(url);
            latencies.push(performance.now() - t0);
            completed++;
        }
    };

    await Promise.all(Array.from({ length: concurrency }, runner));

    const totalMs = performance.now() - testStart;
    latencies.sort((a, b) => a - b);

    const sum = latencies.reduce((a, b) => a + b, 0);
    const p99Index = Math.floor(latencies.length * 0.99);
    const m = process.memoryUsage();

    return {
        concurrency,
        rps: Math.round((completed / totalMs) * 1000),
        avgMs: Math.round(sum / latencies.length),
        maxMs: Math.round(latencies[latencies.length - 1]!),
        p99Ms: Math.round(latencies[p99Index]!),
        rssMB: Math.round(m.rss / 1e6),
    };
}

async function main(): Promise<void> {
    const server = await startServer();
    console.log(`Local server listening on ${url}\n`);

    const levels = [1, 10, 25, 50, 100, 200, 500, 1000, 2000, 5000];
    const requestsPerLevel = 10000;

    console.log(`Benchmark: ${requestsPerLevel} requests per concurrency level\n`);
    console.log('concurrency | req/s | avg(ms) | p99(ms) | max(ms) | RSS(MB)');
    console.log('------------|-------|---------|---------|---------|--------');

    try {
        for (const c of levels) {
            const session = new SessionClient(moduleClient);
            const result = await runAtConcurrency(session, c, requestsPerLevel);
            console.log(
                `${String(result.concurrency).padStart(11)} | ${String(result.rps).padStart(5)} | ${String(result.avgMs).padStart(7)} | ${String(result.p99Ms).padStart(7)} | ${String(result.maxMs).padStart(7)} | ${String(result.rssMB).padStart(6)}`,
            );
            await session.destroySession();
        }
    } finally {
        console.log('\nCleaning up...\n');
        await moduleClient.terminate();
        await stopServer(server);
        console.log('Done.\n');
    }
}

await main();
