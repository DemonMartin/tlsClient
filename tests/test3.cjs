function logStats(moduleClient, id) {
    const memoryData = process.memoryUsage();
    const poolStats = moduleClient.getPoolStats();

    console.log(`ModuleClient ${id} Stats:`, {
        memory: {
            heapUsed: `${Math.round(memoryData.heapUsed / 1024 / 1024)}MB`,
            rss: `${Math.round(memoryData.rss / 1024 / 1024)}MB`,
        },
        workers: {
            ...poolStats,
        },
    });
}

(async () => {
    // Dynamic import for CommonJS
    const tlsClientModule = await import('../src/index.js');

    // Create and initialize module clients sequentially to ensure proper pool creation
    const moduleClient1 = new tlsClientModule.ModuleClient({ maxThreads: 4 });
    const moduleClient2 = new tlsClientModule.ModuleClient({ maxThreads: 4 });
    const moduleClient3 = new tlsClientModule.ModuleClient({ maxThreads: 4 });

    // Force initialization of each pool
    const initSession1 = new tlsClientModule.SessionClient(moduleClient1);
    const initSession2 = new tlsClientModule.SessionClient(moduleClient2);
    const initSession3 = new tlsClientModule.SessionClient(moduleClient3);

    await Promise.all([
        initSession1.get('http://localhost:6969'),
        initSession2.get('http://localhost:6969'),
        initSession3.get('http://localhost:6969'),
    ]);

    await Promise.all([initSession1.destroySession(), initSession2.destroySession(), initSession3.destroySession()]);

    try {
        // Create sessions for each module client
        const sessions = [
            {
                module: moduleClient1,
                sessions: Array.from({ length: 3 }, () => new tlsClientModule.SessionClient(moduleClient1)),
            },
            {
                module: moduleClient2,
                sessions: Array.from({ length: 3 }, () => new tlsClientModule.SessionClient(moduleClient2)),
            },
            {
                module: moduleClient3,
                sessions: Array.from({ length: 3 }, () => new tlsClientModule.SessionClient(moduleClient3)),
            },
        ];

        // Run 3 requests on each session of each module client
        const requests = sessions.flatMap(({ module, sessions }, moduleIdx) =>
            sessions.flatMap((session, sessionIdx) =>
                Array.from({ length: 3 }, async (_, requestIdx) => {
                    try {
                        const response = await session.get('http://localhost:6969');
                        console.log(
                            `ModuleClient ${moduleIdx + 1}, Session ${sessionIdx + 1}, Request ${requestIdx + 1}: ${
                                response.status
                            }`
                        );

                        // Log pool stats after each request
                        logStats(module, moduleIdx + 1);

                        return response;
                    } catch (error) {
                        console.error(
                            `Error in ModuleClient ${moduleIdx + 1}, Session ${sessionIdx + 1}, Request ${
                                requestIdx + 1
                            }:`,
                            error
                        );
                        throw error;
                    }
                })
            )
        );

        // Execute all requests concurrently
        await Promise.all(requests);

        // Final stats
        console.log('\nFinal Stats:');
        sessions.forEach(({ module }, idx) => {
            logStats(module, idx + 1);
        });

        // Cleanup: destroy all sessions and terminate module clients
        await Promise.all(sessions.flatMap(({ sessions }) => sessions.map((session) => session.destroySession())));

        await Promise.all([moduleClient1.terminate(), moduleClient2.terminate(), moduleClient3.terminate()]);

        console.log('All operations completed successfully');
    } catch (error) {
        console.error('Test failed:', error);
    }
})();
