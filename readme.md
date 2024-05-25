# TlsClientWrapper
A wrapper for `bogdanfinn/tls-client` based on koffi for unparalleled performance and usability. Inspired by `@dryft/tlsclient`.

# Installation
With npm: 
```bash
npm install tlsclientwrapper
```

# Information
This module, compared to bogdanfinn's example, offers:
1. Advanced JSDocs for faster development.
2. Use of the more updated koffi.
3. Automatic conversations, session support, etc.
4. Default settings compatible with bogdafinn's client.
5. Built-in automatic retries on specific status codes.
6. Automatic download of the required library file.
7. Many more enhancements!

# Usage
### Simple Get Request:
```js
import tlsClient from 'tlsclientwrapper';
const client = new tlsClient();

console.log(await client.get("https://example.com/"));
```

### Default Headers/Cookies for all Requests:
```js
import tlsClient from 'tlsclientwrapper';
const client = new tlsClient({
    defaultHeaders: {
        "Custom-Header": "Custom-Value",
        "User-Agent": "TlsClient/1.0"
    },
    defaultCookies: [
        {
            domain: "example.com",
            expires: 0,
            name: "testCookie",
            path: "/",
            value: "testValue"
        }
    ]
});

console.log(await client.get("https://myhttpheader.com/"));
```

### TLS Request
*Don't worry, all requests by default are sent imitating chrome_120 TLS*
```js
import tlsClient from 'tlsclientwrapper';
const client = new tlsClient({
    tlsClientIdentifier: "chrome_120" // For alternatives, check the docs or the JSDocs
});

console.log(await client.get("https://tls.peet.ws/api/all"));
```
> For more Identifiers, check here: https://bogdanfinn.gitbook.io/open-source-oasis/tls-client/supported-and-tested-client-profiles

### Custom Library
```js
import tlsClient from 'tlsclientwrapper';
import path from 'node:path';
const client = new tlsClient({
    customLibraryPath: path.join(process.cwd(), 'lib', 'customLib.dll') // Path must be complete
    //customLibraryDownloadPath: path.join(process.cwd(), 'lib') -> Can also be set if wanted, else os.temp or process.cwd is used.
});

console.log(await client.get("https://example.com/"));
```

> ⚠️ Warning ⚠️
> - All the JSDocs are currently based on the TLSClient Version 1.7.5, if you're using a custom LibraryPath it will not update the JSDocs.
> - Koffi isn't might not be supported by your platform. Please check: https://github.com/Koromix/koffi and verify that your platform is officially supported.

### Constructor Options
```js
/**
 * @typedef {Object} TlsClientDefaultOptions
 * @property {ClientProfile} [tlsClientIdentifier='chrome_124'] - Identifier of the TLS client
 * @property {boolean} [rotateSessions=false] - If true, sessions will be rotated on each request -> This will cause the cookies to be reset
 * @property {string|null} [customLibraryPath=null] - Path to the custom library file
 * @property {string|null} [customLibraryDownloadPath=null] - Path to the custom library download folder
 * @property {boolean} [retryIsEnabled=true] - If true, wrapper will retry the request based on retryStatusCodes
 * @property {number} [retryMaxCount=3] - Maximum number of retries
 * @property {number[]} [retryStatusCodes=[408, 429, 500, 502, 503, 504, 521, 522, 523, 524]] - Status codes for retries
 * @property {boolean} [catchPanics=false] - If true, panics will be caught
 * @property {certificatePinningHosts|null} [certificatePinningHosts=null] - Hosts for certificate pinning
 * @property {CustomTLSClient|null} [customTlsClient=null] - Custom TLS client
 * @property {TransportOptions|null} [transportOptions=null] - Transport options
 * @property {boolean} [followRedirects=false] - If true, redirects will be followed
 * @property {boolean} [forceHttp1=false] - If true, HTTP/1 will be forced
 * @property {string[]} [headerOrder=["host", "user-agent", "accept", "accept-language", "accept-encoding", "connection", "upgrade-insecure-requests", "if-modified-since", "cache-control", "dnt", "content-length", "content-type", "range", "authorization", "x-real-ip", "x-forwarded-for", "x-requested-with", "x-csrf-token", "x-request-id", "sec-ch-ua", "sec-ch-ua-mobile", "sec-ch-ua-platform", "sec-fetch-dest", "sec-fetch-mode", "sec-fetch-site", "origin", "referer", "pragma", "max-forwards", "x-http-method-override", "if-unmodified-since", "if-none-match", "if-match", "if-range", "accept-datetime"]] - Order of headers
 * @property {Object|null} [defaultHeaders=Object] - default headers which will be used in every request - Default: UserAgent Chrome v120
 * @property {boolean} [insecureSkipVerify=false] - If true, insecure verification will be skipped
 * @property {boolean} [isByteRequest=false] - If true, the request is a byte request
 * @property {boolean} [isByteResponse=false] - If true, the response is a byte response
 * @property {boolean} [isRotatingProxy=false] - If true, the proxy is rotating
 * @property {String|null} [proxyUrl=null] - URL of the proxy. Example: http://user:password@ip:port
 * @property {Cookie[]|null} [defaultCookies=null] - Cookies of the request
 * @property {boolean} [disableIPV6=false] - If true, IPV6 will be disabled
 * @property {null} [localAddress=null] - Local address [not Sure? Docs are not clear]
 * @property {string} [serverNameOverwrite=''] - Lookup https://bogdanfinn.gitbook.io/open-source-oasis/tls-client/client-options
 * @property {null} streamOutputBlockSize - Block size of the stream output
 * @property {null} streamOutputEOFSymbol - EOF symbol of the stream output
 * @property {null} streamOutputPath - Path of the stream output
 * @property {number} [timeoutMilliseconds=0] - Timeout in milliseconds
 * @property {number} [timeoutSeconds=60] - Timeout in seconds
 * @property {boolean} [withDebug=false] - If true, debug mode is enabled
 * @property {boolean} [withDefaultCookieJar=true] - If true, the default cookie jar is used
 * @property {boolean} [withoutCookieJar=false] - If true, the cookie jar is not used
 * @property {boolean} [withRandomTLSExtensionOrder=true] - If true, the order of TLS extensions is randomized
 */
```

### Additional options for overriding defaults
```js
/**
 * @typedef {Object} TlsClientOptions
 * @property {boolean} catchPanics - If true, panics will be caught
 * @property {null} certificatePinningHosts - Hosts for certificate pinning
 * @property {null} customTlsClient - Custom TLS client
 * @property {null} transportOptions - Transport options
 * @property {boolean} followRedirects - If true, redirects will be followed
 * @property {boolean} forceHttp1 - If true, HTTP/1 will be forced
 * @property {null} headerOrder - Order of headers
 * @property {null} headers - Headers
 * @property {boolean} insecureSkipVerify - If true, insecure verification will be skipped
 * @property {boolean} isByteRequest -  When you set isByteRequest to true the request body needs to be a base64 encoded string. Useful when you want to upload images for example.
 * @property {boolean} isByteResponse - When you set isByteResponse to true the response body will be a base64 encoded string. Useful when you want to download images for example.
 * @property {boolean} isRotatingProxy - If true, the proxy is rotating
 * @property {null} proxyUrl - URL of the proxy
 * @property {null} requestBody - Body of the request
 * @property {null} requestCookies - Cookies of the request
 * @property {null} defaultHeaders - Default headers
 * @property {boolean} disableIPV6 - If true, IPV6 will be disabled
 * @property {null} localAddress - Local address
 * @property {null} sessionId - ID of the session
 * @property {string} serverNameOverwrite - Overwrite server name
 * @property {null} streamOutputBlockSize - Block size of the stream output
 * @property {null} streamOutputEOFSymbol - EOF symbol of the stream output
 * @property {null} streamOutputPath - Path of the stream output
 * @property {number} timeoutMilliseconds - Timeout in milliseconds
 * @property {number} timeoutSeconds - Timeout in seconds
 * @property {string} tlsClientIdentifier - Identifier of the TLS client
 * @property {boolean} withDebug - If true, debug mode is enabled
 * @property {boolean} withDefaultCookieJar - If true, the default cookie jar is used
 * @property {boolean} withoutCookieJar - If true, the cookie jar is not used
 * @property {boolean} withRandomTLSExtensionOrder - If true, the order of TLS extensions is randomized
 * Custom configurable options for the TLS client
 * @property {boolean} [retryIsEnabled=true] - If true, wrapper will retry the request based on retryStatusCodes
 * @property {number} [retryMaxCount=3] - Maximum number of retries
 * @property {number[]} [retryStatusCodes=[408, 429, 500, 502, 503, 504, 521, 522, 523, 524]] - Status codes for retries
*/
```

### TlsClientReponse
```js
/**
 * @typedef {Object} TlsClientResponse
 * @property {string} sessionId - The reusable sessionId if provided on the request
 * @property {number} status - The status code of the response
 * @property {string} target - The target URL of the request
 * @property {string} body - The response body as a string, or the error message
 * @property {Object} headers - The headers of the response
 * @property {Object} cookies - The cookies of the response
 * @property {number} retryCount - The number of retries
 */
```


# Additional Information
For more Documentation, please check https://bogdanfinn.gitbook.io/open-source-oasis
Special thanks to [@bogdanfinn](https://github.com/bogdanfinn) and [@heydryft](https://github.com/heydryft) which both did great work and helped me build this wrapper.


