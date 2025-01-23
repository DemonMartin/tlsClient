# TlsClientWrapper

A high-performance Node.js wrapper for `bogdanfinn/tls-client` using Koffi bindings and worker thread pools.

## Features

- ⚡ Multi-threaded request handling via Piscina worker pools
- 🔄 Automatic session management and cookie handling
- 🛡️ Latest TLS fingerprint support (Chrome 131, Firefox 133, etc.)
- 🔄 Built-in retry mechanism for failed requests
- 📚 Comprehensive TypeScript definitions and JSDocs
- 🔌 Automatic TLS library download and management

## Installation

```bash
npm install tlsclientwrapper
```

## Core Concepts

### Architecture Overview

TlsClientWrapper uses a two-tier architecture:

1. **ModuleClient**: Manages the worker pool and TLS library | Important: Piscana seems to share the pools by default, meaning creating multiple ones wont change anything.
2. **SessionClient**: Handles individual TLS sessions and requests

```plaintext
ModuleClient (Worker Pool)
├─ SessionClient 1
├─ SessionClient 2
└─ SessionClient N
```

### Basic Usage

```javascript
import { ModuleClient, SessionClient } from 'tlsclientwrapper';

// 1. Create the worker pool manager
const moduleClient = new ModuleClient();

// 2. Create a session for making requests
const session = new SessionClient(moduleClient);

// 3. Make requests
const response = await session.get('https://example.com');

// 4. Clean up
await session.destroySession();
await moduleClient.terminate();
```

### CommonJS Usage

```javascript
// CommonJS environment requires dynamic import
(async () => {
    // Dynamic import for CommonJS
    const tlsClientModule = await import('tlsclientwrapper');
    
    // Create the worker pool manager
    const moduleClient = new tlsClientModule.ModuleClient({
        maxThreads: 4
    });

    // Create a session for making requests
    const session = new tlsClientModule.SessionClient(moduleClient);

    const response = await session.get('https://example.com');
    console.log(response);

    await session.destroySession();
    await moduleClient.terminate();
})();
```

### Managing Multiple Sessions

```javascript
const moduleClient = new ModuleClient({
    maxThreads: 8  // Optimize thread count (more Threads = more concurrent Requests, test whats the best for you)
});

// Create multiple sessions for different purposes
const loginSession = new SessionClient(moduleClient, {
    defaultHeaders: { 'User-Agent': 'Chrome/131.0.0.0' }
});

const apiSession = new SessionClient(moduleClient, {
    defaultHeaders: { 'Authorization': 'Bearer token' }
});

// Use sessions concurrently
await Promise.all([
    loginSession.post('https://example.com/login', credentials),
    apiSession.get('https://example.com/api/data')
]);

// Clean up
await loginSession.destroySession();
await apiSession.destroySession();
await moduleClient.terminate();
```

### Request Options & Retry Logic

```javascript
const session = new SessionClient(moduleClient, {
    // TLS Configuration
    tlsClientIdentifier: 'chrome_131',
    forceHttp1: false,
    
    // Retry Configuration
    retryIsEnabled: true,
    retryMaxCount: 3,
    retryStatusCodes: [429, 503, 504],
    
    // Network Configuration
    timeoutSeconds: 30,
    proxyUrl: 'http://proxy:8080',
    
    // Default Headers & Cookies
    defaultHeaders: {
        'User-Agent': 'Custom/1.0'
    },
    defaultCookies: [{
        domain: 'example.com',
        name: 'session',
        value: 'xyz'
    }]
});
```

### Batch Processing

```javascript
const moduleClient = new ModuleClient();
const session = new SessionClient(moduleClient);

// Process multiple URLs efficiently
const urls = Array.from({ length: 100 }, 
    (_, i) => `https://api.example.com/item/${i}`
);

// Batch requests with concurrency control
const batchSize = 10;
for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const responses = await Promise.all(
        batch.map(url => session.get(url))
    );
    console.log(`Processed batch ${i/batchSize + 1}`);
}

await session.destroySession();
await moduleClient.terminate();
```

### Monitoring & Debugging

```javascript
const moduleClient = new ModuleClient();

// Monitor worker pool performance
setInterval(() => {
    const stats = moduleClient.getPoolStats();
    console.log(stats);
}, 5000);

const session = new SessionClient(moduleClient, {
    withDebug: true  // Enable debug logging
});

// ... your requests ...
```

## API Reference

### ModuleClient Options

```js
/**
 * @typedef {Object} TlsClientDefaultOptions
 * @property {ClientProfile} [tlsClientIdentifier='chrome_124'] - Identifier of the TLS client
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
 * @property {Object|null} [defaultHeaders=Object] - default headers which will be used in every request - Default: UserAgent Chrome v124
 * @property {Object|null} [connectHeaders=null] - Headers to be used during the CONNECT request.
 * @property {boolean} [insecureSkipVerify=false] - If true, insecure verification will be skipped
 * @property {boolean} [isByteRequest=false] - If true, the request is a byte request
 * @property {boolean} [isByteResponse=false] - If true, the response is a byte response
 * @property {boolean} [isRotatingProxy=false] - If true, the proxy is rotating
 * @property {String|null} [proxyUrl=null] - URL of the proxy. Example: http://user:password@ip:port
 * @property {Cookie[]|null} [defaultCookies=null] - Cookies of the request
 * @property {boolean} [disableIPV6=false] - If true, IPV6 will be disabled
 * @property {boolean} [disableIPV4=false] - If true, IPV4 will be disabled
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

### SessionClient Options

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

### Response Type

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

## Platform Support

This wrapper requires:

- Node.js 16.x or later
- Platform supported by Koffi (Windows, macOS, Linux)
- x64, arm64, or compatible architecture

## Credits

Special thanks to:

- [@bogdanfinn](https://github.com/bogdanfinn) for the TLS client
- The Koffi team for the FFI bindings

## Additional Resources

- [TLS Client Documentation](https://bogdanfinn.gitbook.io/open-source-oasis)
- [Supported TLS Fingerprints](https://bogdanfinn.gitbook.io/open-source-oasis/tls-client/supported-and-tested-client-profiles)
