const tlsCLient = require('./index.cjs')

async function testRequest() {
    const xtlsClient = new tlsCLient({
        tlsClientIdentifier: "chrome_120"
    });
    const response = await xtlsClient.get("https://share.martin.tools/");
    console.log(response);

    xtlsClient.terminate();
    return response;
}

(async () => {
    await testRequest();
})();

