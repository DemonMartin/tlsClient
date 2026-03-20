# TlsClientWrapper

A high-performance Node.js wrapper for `bogdanfinn/tls-client` using Koffi's async FFI bindings.
Now with TypeScript Support.

## Features

- ⚡ Non-blocking async FFI calls via koffi
- 🔄 Automatic session management and cookie handling
- 🛡️ Latest TLS fingerprint support (Chrome 146, Firefox 147, Safari iOS 26, etc.)
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

1. **ModuleClient**: Loads the native TLS library and exposes async FFI bindings via koffi
2. **SessionClient**: Handles individual TLS sessions and requests

```plaintext
ModuleClient (koffi FFI bindings)
├─ SessionClient 1
├─ SessionClient 2
└─ SessionClient N
```

### Memory and scaling

- Use **one** `ModuleClient` per process and share it across many `SessionClient` instances. Each `ModuleClient` loads the native library once; creating multiple module clients is wasteful.
- Each `SessionClient` maps to a Go-side session (cookies, TLS state). Call `await session.destroySession()` when done, or use **`await using`** / `Symbol.asyncDispose` so the session is torn down when the handle goes out of scope. Dropped sessions without cleanup keep Go memory until process exit.
- If response latency degrades after many thousands of requests on the same session, destroy and recreate the session to reset the Go-side connection pool state.

### Basic Usage

Now TypeScript, ESM and CJS are supported.

```typescript
import { ModuleClient, SessionClient } from 'tlsclientwrapper';

// 1. Load the native TLS library
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
const moduleClient = new ModuleClient();

// Create multiple sessions for different purposes
const loginSession = new SessionClient(moduleClient, {
    defaultHeaders: { 'User-Agent': 'Chrome/146.0.0.0' },
});

const apiSession = new SessionClient(moduleClient, {
    defaultHeaders: { Authorization: 'Bearer token' },
});

// Use sessions concurrently
await Promise.all([
    loginSession.post('https://example.com/login', credentials),
    apiSession.get('https://example.com/api/data'),
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
    tlsClientIdentifier: 'chrome_146',

    // Retry Configuration
    retryIsEnabled: true,
    retryMaxCount: 3,
    retryStatusCodes: [429, 503, 504],

    // Network Configuration
    timeoutSeconds: 30,
    proxyUrl: 'http://proxy:8080',

    // Default Headers & Cookies
    defaultHeaders: {
        'User-Agent': 'Custom/1.0',
    },
    defaultCookies: [
        {
            domain: 'example.com',
            name: 'session',
            value: 'xyz',
        },
    ],
});
```

### Batch Processing

```javascript
const moduleClient = new ModuleClient();
const session = new SessionClient(moduleClient);

// Process multiple URLs efficiently
const urls = Array.from({ length: 100 }, (_, i) => `https://api.example.com/item/${i}`);

// Batch requests with concurrency control
const batchSize = 10;
for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const responses = await Promise.all(batch.map((url) => session.get(url)));
    console.log(`Processed batch ${i / batchSize + 1}`);
}

await session.destroySession();
await moduleClient.terminate();
```

## API Reference

For detailed API documentation and type information, explore the source code or use an editor with TypeScript Intellisense support. All public classes and methods are fully typed and documented for easy discovery.

## Platform Support

This wrapper requires:

- Node.js 18.x or later
- Platform supported by Koffi (Windows, macOS, Linux)
- x64, arm64, or compatible architecture

## Credits

Special thanks to:

- [@bogdanfinn](https://github.com/bogdanfinn) for the TLS client
- The Koffi team for the FFI bindings

## Additional Resources

- [TLS Client Documentation](https://bogdanfinn.gitbook.io/open-source-oasis)
- [Supported TLS Fingerprints](https://bogdanfinn.gitbook.io/open-source-oasis/tls-client/supported-and-tested-client-profiles)
