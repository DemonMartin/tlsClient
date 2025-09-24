# TlsClientWrapper

A high-performance Node.js wrapper for `bogdanfinn/tls-client` using Koffi bindings and worker thread pools.
Now with TypeScript Support.

## Features

- ⚡ Multi-threaded request handling via Piscina worker pools
- 🔄 Automatic session management and cookie handling
- 🛡️ Latest TLS fingerprint support (Chrome 131, Firefox 133, etc.)
- 🔄 Built-in retry mechanism for failed requests
- 📚 Full TypeScript support and proper JSDocs for ESM and CJS support
- 🔌 Automatic TLS library download and management

## Installation

```bash
npm install tlsclientwrapper
# or
pnpm add tlsclientwrapper
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

Now TypeScript, ESM and CJS are supported.

```typescript
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

For detailed API documentation and type information, explore the source code or use an editor with TypeScript Intellisense support. All public classes and methods are fully typed and documented for easy discovery.

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
