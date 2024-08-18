(async () => {
    const tlsClientModule = await import('./index.js');
    const tlsClient = tlsClientModule.default;


    for (let i = 0; i < 1000; i++) {
        const client = new tlsClient();
        console.log(await client.get("https://echo.zuplo.io/"));
        await client.terminate();
    }
})();