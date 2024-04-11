import TlsDependency from "./utils/path.js";
import TlsClient from "./index.js";
import axios from "axios";
import path from "path";

const tlsDependency = new TlsDependency();
const tlsDependencyPath = tlsDependency.getTLSDependencyPath();
console.log(tlsDependencyPath);

const runInnerRequests = async (tlsClient) => {
    const innerPromises = Array(1).fill().map(async () => {
        const requestStart = performance.now();
        await tlsClient.get("https://share.martin.tools/");
        const requestEnd = performance.now();
        return requestEnd - requestStart;
    });

    const responseTimes = await Promise.allSettled(innerPromises);
    return responseTimes
        .filter(response => response.status === 'fulfilled')
        .map(response => response.value);
};

const runRequests = async () => {
    const start = performance.now();
    const promises = Array(100).fill().map(async () => {
        const tlsClient = new TlsClient({
            tlsClientIdentifier: "chrome_120"
        });
        const responseTimes = await runInnerRequests(tlsClient);
        console.log(await tlsClient.terminate());
        return responseTimes;
    });

    const responses = await Promise.allSettled(promises);
    const end = performance.now();

    const responseTimes = responses
        .filter(response => response.status === 'fulfilled')
        .flatMap(response => response.value);

    const totalTime = Math.floor(end - start);
    const avgTimePerRequest = totalTime / responseTimes.length;

    const sortedTimes = responseTimes.sort((a, b) => a - b);
    const minTime = sortedTimes[0];
    const maxTime = sortedTimes[sortedTimes.length - 1];
    const medianTime = sortedTimes[Math.floor(sortedTimes.length / 2)];

    console.log(`Total time: ${totalTime} ms`);
    console.log(`Average time per request: ${avgTimePerRequest} ms`);
    console.log(`Minimum time: ${minTime} ms`);
    console.log(`Maximum time: ${maxTime} ms`);
    console.log(`Median time: ${medianTime} ms`);
};

async function axiosTest() {
    const start = performance.now();
    const promises = Array(1).fill().map(async () => {
        const responseTimes = Array(100).fill().map(async () => {
            const requestStart = performance.now();
            await axios.get("https://share.martin.tools/");
            const requestEnd = performance.now();
            return requestEnd - requestStart;
        });

        return await Promise.allSettled(responseTimes);
    });

    const responses = await Promise.allSettled(promises);
    const end = performance.now();

    const responseTimes = responses
        .filter(response => response.status === 'fulfilled')
        .flatMap(response => response.value.flatMap(innerResponse => innerResponse));

    const totalTime = Math.floor(end - start);
    const avgTimePerRequest = totalTime / responseTimes.length;

    const sortedTimes = responseTimes.sort((a, b) => a - b);
    const minTime = sortedTimes[0];
    const maxTime = sortedTimes[sortedTimes.length - 1];
    const medianTime = sortedTimes[Math.floor(sortedTimes.length / 2)];

    console.log(`Total time: ${totalTime} ms`);
    console.log(`Average time per request: ${avgTimePerRequest} ms`);
    console.log(`Minimum time: ${minTime} ms`);
    console.log(`Maximum time: ${maxTime} ms`);
    console.log(`Median time: ${medianTime} ms`);

}

async function oneRequest() {
    const tlsClient = new TlsClient();
    const start = performance.now();
    const response = await tlsClient.get("https://httpbin.org/status/408", {
        withDebug: true
    });
    const end = performance.now();
    console.log(response)
    console.log(`Total time: ${end - start} ms`);
    console.log(await tlsClient.terminate());
}

async function oneAxiosRequest() {
    const start = performance.now();
    const response = await axios.get("https://share.martin.tools/");
    const end = performance.now();
    console.log(response)
    console.log(`Total time: ${end - start} ms`);
}

async function defineAndGo() {
    const tlsClient = new TlsClient();
    const response = await tlsClient.get("https://share.martin.tools/");
    console.log(response);
    console.log(await tlsClient.terminate());
}

async function fetchCookiesAndAddCookies() {
    const tlsClient = new TlsClient();
    const response = await tlsClient.get("https://www.google.com/");
    console.log(response);
    console.log(tlsClient.getSession())
    console.log(await tlsClient.getCookiesFromSession(
        tlsClient.getSession(),
        "https://www.google.com/"
    ));

    console.log(await tlsClient.addCookiesToSession(
        tlsClient.getSession(),
        "https://www.google.com/",
        [
            {
                domain: "https://www.google.com/",
                expires: 17261091660,
                name: "testCookie",
                path: "/",
                value: "testValue"
            }
        ]
    ));

    console.log((await tlsClient.getCookiesFromSession(
        tlsClient.getSession(),
        "https://www.google.com/"
    )));
    console.log(await tlsClient.terminate());

}

async function customLibraryFetch() {
    const tlsClient = new TlsClient({
        customLibraryPath: path.join(String.raw`C:\Users\skubi\Downloads\tls-client-windows-64-v1.7.2.dll`)
    });
    const response = await tlsClient.get("https://share.martin.tools/");
    console.log(response);
    console.log(await tlsClient.terminate());
}

async function customLibraryDownloadPath() {
    const tlsClient = new TlsClient({
        customLibraryDownloadPath: path.join(String.raw`C:\Users\skubi\Desktop\Folder\GitHub`),
    });
    const response = await tlsClient.get("https://share.martin.tools/");
    console.log(response);
    console.log(await tlsClient.terminate());
}

(async () => {
    //await axiosTest();
    //await runRequests();
    //await oneRequest();
    //await oneAxiosRequest();
    //await defineAndGo();
    //await fetchCookiesAndAddCookies()
    //await customLibraryFetch();
    //await customLibraryDownloadPath();
})();

