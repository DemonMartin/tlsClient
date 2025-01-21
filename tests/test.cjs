function logMemoryUsage() {
    const formatMemoryUsage = (data) => `${Math.round((data / 1024 / 1024) * 100) / 100} MB`;
    const memoryData = process.memoryUsage();

    const memoryUsage = {
        rss: `${formatMemoryUsage(
            memoryData.rss
        )} -> Resident Set Size - total memory allocated for the process execution`,
        heapTotal: `${formatMemoryUsage(memoryData.heapTotal)} -> total size of the allocated heap`,
        heapUsed: `${formatMemoryUsage(memoryData.heapUsed)} -> actual memory used during the execution`,
        external: `${formatMemoryUsage(memoryData.external)} -> V8 external memory`,
    };

    console.log('Memory usage:', memoryUsage);
}

function logStats(module) {
    const memoryData = process.memoryUsage();
    const poolStats = module.getPoolStats();

    console.log('Status:', {
        memory: {
            heapUsed: `${Math.round(memoryData.heapUsed / 1024 / 1024)}MB`,
            rss: `${Math.round(memoryData.rss / 1024 / 1024)}MB`,
        },
        workers: {
            busy: poolStats?.busyWorkers ?? 0,
            total: poolStats?.totalWorkers ?? 0,
            pending: poolStats?.pendingTasks ?? 0,
        },
    });
}

(async () => {
    const tlsClientModule = await import('../src/index.js');
    const module = new tlsClientModule.ModuleClient();

    // do a single request and destroySession to init the module
    const client = new tlsClientModule.SessionClient(module);
    await client.get('https://echo.zuplo.io/');
    await client.destroySession();

    logMemoryUsage();

    // Helper to chunk array into smaller arrays
    const chunk = (arr, size) => {
        return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
    };

    // Function to make a request
    const makeRequest = async (i) => {
        try {
            const client = new tlsClientModule.SessionClient(module);
            const startTime = Date.now();
            const response = await client.get('https://echo.zuplo.io/');
            const duration = Date.now() - startTime;
            console.log(`Request ${i} completed: ${response.status} (${duration}ms)`);

            await client.destroySession();
        } catch (err) {
            console.error(`Request ${i} failed:`, err);
        }
    };

    const TOTAL_REQUESTS = 1000;
    const BATCH_SIZE = 50; // Process 50 requests concurrently

    // Create array of request indices
    const requestIndices = Array.from({ length: TOTAL_REQUESTS }, (_, i) => i);

    // Split into batches
    const batches = chunk(requestIndices, BATCH_SIZE);

    console.log(`Processing ${TOTAL_REQUESTS} requests in ${batches.length} batches of ${BATCH_SIZE}`);

    // Process each batch
    for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`Starting batch ${i + 1}/${batches.length}`);

        // Process batch concurrently
        await Promise.all(batch.map((index) => makeRequest(index)));

        console.log(`Completed batch ${i + 1}/${batches.length}`);

        logStats(module);

        // wait 30s
        //await new Promise((resolve) => setTimeout(resolve, 30000));
    }

    console.log('All requests completed');
    await module.terminate();
    logStats(module);
})().catch(console.error);
