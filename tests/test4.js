import { ModuleClient, SessionClient } from '../src/index.js';

async function simpleGoogleTest() {
    console.log('Starting simple Google GET request test...\n');

    // Create module and session clients
    const module = new ModuleClient();
    const client = new SessionClient(module);

    try {
        // Measure request timing
        const startTime = performance.now();

        // Make GET request to Google
        const response = await client.get('https://www.google.com/');

        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);

        // Log results
        console.log('✅ Request completed successfully!');
        console.log(`🚀 Speed: ${duration}ms`);
        console.log(`📊 Status: ${response.status}`);
        console.log(`🎯 Target: ${response.target}`);
        console.log(`📝 Response body length: ${response.body?.length || 0} characters`);
        console.log(`🍪 Cookies received: ${Object.keys(response.cookies || {}).length}`);

        // Memory usage
        const memoryUsage = process.memoryUsage();
        console.log(`💾 Memory usage: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`);
    } catch (error) {
        console.error('❌ Request failed:', error.message);
    } finally {
        // Cleanup
        try {
            await client.destroySession();
            await module.terminate();
            console.log('\n🧹 Cleanup completed');
        } catch (cleanupError) {
            console.error('⚠️ Cleanup error:', cleanupError.message);
        }
    }
}

// Run the test
simpleGoogleTest().catch(console.error);
