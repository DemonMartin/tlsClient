(async () => {
    const tlsClientModule = await import('./index.js');
    const tlsClient = tlsClientModule.default;

    const client = new tlsClient();

    console.log(await client.get("https://echo.zuplo.io/"));
    await client.terminate();
})();