const crypto = require('node:crypto');

(async () => {
    const tlsClientModule = await import('../src/index.js');
    const module = new tlsClientModule.ModuleClient();

    const client = new tlsClientModule.SessionClient(module);

    // Send initial GET request to /cookietest
    try {
        const response1 = await client.get('http://localhost:6969/cookietest');
        console.log('First Response:', response1);
    } catch (err) {
        console.error('First request failed:', err);
    }

    // Wait for 15 seconds
    await new Promise((resolve) => setTimeout(resolve, 15000));

    // Send second GET request to /cookietest
    try {
        const response2 = await client.get('http://localhost:6969/cookietest');
        console.log('Second Response:', response2);
    } catch (err) {
        console.error('Second request failed:', err);
    }

    // Terminate the module
    try {
        const terminationResult = await module.terminate();
        console.log('Module termination successful:', terminationResult);
    } catch (error) {
        console.error('Error during ModuleClient termination:', error);
    }

    // Log final stats
    try {
        const finalStats = module.getPoolStats();
        console.log('Final Pool Stats:', finalStats);
    } catch (error) {
        console.error('Error retrieving pool stats:', error);
    }
})().catch(console.error);
