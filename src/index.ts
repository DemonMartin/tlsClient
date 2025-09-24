import ModuleClient from './utils/client.js';
import crypto from 'node:crypto';
import type { Piscina } from 'piscina';

// Type definitions
export type ChromeProfile =
    | 'chrome_103'
    | 'chrome_104'
    | 'chrome_105'
    | 'chrome_106'
    | 'chrome_107'
    | 'chrome_108'
    | 'chrome_109'
    | 'chrome_110'
    | 'chrome_111'
    | 'chrome_112'
    | 'chrome_116_PSK'
    | 'chrome_116_PSK_PQ'
    | 'chrome_117'
    | 'chrome_120'
    | 'chrome_124'
    | 'chrome_131'
    | 'chrome_131_PSK'
    | 'chrome_133'
    | 'chrome_133_PSK';

export type SafariProfile = 'safari_15_6_1' | 'safari_16_0';

export type SafariIOSProfile =
    | 'safari_ios_15_5'
    | 'safari_ios_15_6'
    | 'safari_ios_16_0'
    | 'safari_ios_17_0'
    | 'safari_ios_18_0'
    | 'safari_ios_18_5';

export type SafariIpadOSProfile = 'safari_ios_15_6';

export type FirefoxProfile =
    | 'firefox_102'
    | 'firefox_104'
    | 'firefox_105'
    | 'firefox_106'
    | 'firefox_108'
    | 'firefox_110'
    | 'firefox_117'
    | 'firefox_120'
    | 'firefox_123'
    | 'firefox_132'
    | 'firefox_133'
    | 'firefox_135';

export type OperaProfile = 'opera_89' | 'opera_90' | 'opera_91';

export type CustomClientProfile =
    | 'zalando_ios_mobile'
    | 'nike_ios_mobile'
    | 'cloudscraper'
    | 'mms_ios'
    | 'mms_ios_1'
    | 'mms_ios_2'
    | 'mms_ios_3'
    | 'mesh_ios'
    | 'mesh_ios_1'
    | 'confirmed_ios';

export type ClientProfile =
    | ChromeProfile
    | SafariProfile
    | SafariIOSProfile
    | SafariIpadOSProfile
    | FirefoxProfile
    | OperaProfile
    | CustomClientProfile;

/**
 * Certificate pinning hosts configuration
 * @example { "example.com": ["sha256/AAAAAAAAAAAAAAAAAAAAAA=="] }
 */
export interface CertificatePinningHosts {
    [hostname: string]: string[];
}

/**
 * HTTP/2 stream priority parameters
 */
export interface PriorityParam {
    streamDependency?: number;
    exclusive?: boolean;
    weight?: number;
}

/**
 * HTTP/2 priority frame configuration
 */
export interface PriorityFrames {
    streamID: number;
    priorityParam: PriorityParam;
}

/**
 * ECH Candidate Cipher Suite configuration
 */
export interface CanidateCipherSuite {
    kdfId: number;
    aeadId: number;
}

/**
 * Custom TLS client configuration (advanced users only)
 * @description This is unfinished and should be updated in the future, to be better and more accurate
 */
export interface CustomTLSClient {
    /** Compression algorithm for the certificate */
    certCompressionAlgo?: string;
    /** Connection flow */
    connectionFlow?: number;
    /** HTTP/2 settings */
    h2Settings?: Record<string, number>;
    /** Order of HTTP/2 settings */
    h2SettingsOrder?: string[];
    /** Priority of headers */
    headerPriority?: PriorityParam;
    /** JA3 string */
    ja3String?: string;
    /** Key share curves */
    keyShareCurves?: string[];
    /** Priority frames */
    priorityFrames?: PriorityFrames[];
    /** Supported protocols for the ALPN Extension */
    alpnProtocols?: string[];
    /** Supported protocols for the ALPS Extension */
    alpsProtocols?: string[];
    /** List of ECH Candidate Payloads */
    ECHCandidatePayloads?: number[];
    /** ECH Candidate Cipher Suites */
    ECHCandidateCipherSuites?: CanidateCipherSuite[];
    /** Order of pseudo headers */
    pseudoHeaderOrder?: string[];
    /** Supported algorithms for delegated credentials */
    supportedDelegatedCredentialsAlgorithms?: string[];
    /** Supported signature algorithms */
    supportedSignatureAlgorithms?: string[];
    /** Supported versions */
    supportedVersions?: string[];
}

/**
 * HTTP transport configuration options
 */
export interface TransportOptions {
    /** If true, keep-alives will be disabled */
    disableKeepAlives?: boolean;
    /** If true, compression will be disabled */
    disableCompression?: boolean;
    /** Maximum number of idle connections */
    maxIdleConns?: number;
    /** Maximum number of idle connections per host */
    maxIdleConnsPerHost?: number;
    /** Maximum number of connections per host */
    maxConnsPerHost?: number;
    /** Maximum number of response header bytes */
    maxResponseHeaderBytes?: number;
    /** Write buffer size */
    writeBufferSize?: number;
    /** Read buffer size */
    readBufferSize?: number;
    /** Idle connection timeout */
    idleConnTimeout?: number;
}

/**
 * HTTP Cookie representation
 */
export interface Cookie {
    /** The domain of the cookie */
    domain: string;
    /** The expiration time of the cookie */
    expires: number;
    /** The name of the cookie */
    name: string;
    /** The path of the cookie */
    path: string;
    /** The value of the cookie */
    value: string;
}

/**
 * Default options for TLS client configuration
 */
export interface TlsClientDefaultOptions {
    /** Identifier of the TLS client (default: 'chrome_133') */
    tlsClientIdentifier?: ClientProfile;
    /** If true, wrapper will retry the request based on retryStatusCodes (default: true) */
    retryIsEnabled?: boolean;
    /** Maximum number of retries (default: 3) */
    retryMaxCount?: number;
    /** Status codes for retries (default: [408, 429, 500, 502, 503, 504, 521, 522, 523, 524]) */
    retryStatusCodes?: number[];
    /** If true, panics will be caught (default: false) */
    catchPanics?: boolean;
    /** Hosts for certificate pinning */
    certificatePinningHosts?: CertificatePinningHosts | null;
    /** Custom TLS client configuration */
    customTlsClient?: CustomTLSClient | null;
    /** Transport options */
    transportOptions?: TransportOptions | null;
    /** If true, redirects will be followed (default: false) */
    followRedirects?: boolean;
    /** If true, HTTP/1 will be forced (default: false) */
    forceHttp1?: boolean;
    /** Order of headers */
    headerOrder?: string[];
    /** Default headers which will be used in every request */
    defaultHeaders?: Record<string, string> | null;
    /** Headers to be used during the CONNECT request */
    connectHeaders?: Record<string, string> | null;
    /** If true, insecure verification will be skipped (default: false) */
    insecureSkipVerify?: boolean;
    /** If true, the request is a byte request (default: false) */
    isByteRequest?: boolean;
    /** If true, the response is a byte response (default: false) */
    isByteResponse?: boolean;
    /** If true, the proxy is rotating (default: false) */
    isRotatingProxy?: boolean;
    /** URL of the proxy. Example: http://user:password@ip:port */
    proxyUrl?: string | null;
    /** Default cookies for requests */
    defaultCookies?: Cookie[] | null;
    /** If true, IPV6 will be disabled (default: false) */
    disableIPV6?: boolean;
    /** If true, IPV4 will be disabled (default: false) */
    disableIPV4?: boolean;
    /** Local address [not Sure? Docs are not clear] */
    localAddress?: string | null;
    /** Server name overwrite. See: https://bogdanfinn.gitbook.io/open-source-oasis/tls-client/client-options */
    serverNameOverwrite?: string;
    /** Block size of the stream output */
    streamOutputBlockSize?: number | null;
    /** EOF symbol of the stream output */
    streamOutputEOFSymbol?: string | null;
    /** Path of the stream output */
    streamOutputPath?: string | null;
    /** Timeout in milliseconds (default: 0) */
    timeoutMilliseconds?: number;
    /** Timeout in seconds (default: 60) */
    timeoutSeconds?: number;
    /** If true, debug mode is enabled (default: false) */
    withDebug?: boolean;
    /** If true, the default cookie jar is used (default: true) */
    withDefaultCookieJar?: boolean;
    /** If true, the cookie jar is not used (default: false) */
    withoutCookieJar?: boolean;
    /** If true, the order of TLS extensions is randomized (default: true) */
    withRandomTLSExtensionOrder?: boolean;
    /** Custom path to download the TLS library */
    customLibraryDownloadPath?: string | null;
}

/**
 * Options for individual TLS client requests
 * Custom configurable options for the TLS client
 */
export interface TlsClientOptions extends Omit<TlsClientDefaultOptions, 'defaultHeaders' | 'defaultCookies'> {
    /** Headers for this specific request */
    headers?: Record<string, string> | null;
    /** Body of the request */
    requestBody?: string | null;
    /** Cookies for this specific request */
    requestCookies?: Cookie[] | null;
    /** ID of the session [not recommended to use, use the SessionClient instead] */
    sessionId?: string | null;
    /** The target URL */
    requestUrl?: string;
    /** HTTP method (GET, POST, etc.) - internal use only */
    requestMethod?: string;
}

/**
 * Response from TLS client request
 */
export interface TlsClientResponse {
    /** The reusable sessionId if provided on the request */
    sessionId: string;
    /** The status code of the response */
    status: number;
    /** The target URL of the request */
    target: string;
    /** The response body as a string, or the error message */
    body: string;
    /** The headers of the response */
    headers: Record<string, string>;
    /** The cookies of the response */
    cookies: Record<string, Cookie>;
    /** The number of retries */
    retryCount: number;
}

/**
 * Input for getting cookies from a session
 */
export interface GetCookiesInput {
    /** The existing session ID */
    sessionId: string;
    /** The URL to get cookies for */
    url: string;
}

/**
 * Input for adding cookies to a session
 */
export interface AddCookiesInput {
    /** The existing session ID */
    sessionId: string;
    /** The URL to add cookies for */
    url: string;
    /** The cookies to add */
    cookies: Cookie[] | null;
}

/**
 * Response containing cookies
 */
export interface CookieResponse {
    /** The cookies from the response */
    cookies: Cookie[] | null;
}

/**
 * SessionClient class for managing TLS client sessions
 */
export class SessionClient {
    private readonly defaultOptions: Required<TlsClientDefaultOptions>;
    private readonly sessionId: string;
    private readonly moduleClient: ModuleClient;
    private pool: Piscina | null = null;

    /**
     * @description Create a new SessionClient
     * @param {ModuleClient} moduleClient - The shared ModuleClient instance
     * @param {TlsClientDefaultOptions} [options={}] - SessionClient options
     */
    constructor(moduleClient: ModuleClient, options: TlsClientDefaultOptions = {}) {
        if (!moduleClient) {
            throw new Error(
                'ModuleClient must be provided. Please create a new ModuleClient instance and pass it as the first argument.'
            );
        }

        if (!(moduleClient instanceof ModuleClient)) {
            throw new Error('ModuleClient must be an instance of ModuleClient');
        }

        this.defaultOptions = {
            tlsClientIdentifier: 'chrome_133',
            catchPanics: false,
            certificatePinningHosts: null,
            customTlsClient: null,
            customLibraryDownloadPath: null,
            transportOptions: null,
            followRedirects: false,
            forceHttp1: false,
            headerOrder: [
                'host',
                'user-agent',
                'accept',
                'accept-language',
                'accept-encoding',
                'connection',
                'upgrade-insecure-requests',
                'if-modified-since',
                'cache-control',
                'dnt',
                'content-length',
                'content-type',
                'range',
                'authorization',
                'x-real-ip',
                'x-forwarded-for',
                'x-requested-with',
                'x-csrf-token',
                'x-request-id',
                'sec-ch-ua',
                'sec-ch-ua-mobile',
                'sec-ch-ua-platform',
                'sec-fetch-dest',
                'sec-fetch-mode',
                'sec-fetch-site',
                'origin',
                'referer',
                'pragma',
                'max-forwards',
                'x-http-method-override',
                'if-unmodified-since',
                'if-none-match',
                'if-match',
                'if-range',
                'accept-datetime',
            ],
            defaultHeaders: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
            },
            connectHeaders: null,
            insecureSkipVerify: false,
            isByteRequest: false,
            isByteResponse: false,
            isRotatingProxy: false,
            proxyUrl: null,
            defaultCookies: null,
            disableIPV6: false,
            disableIPV4: false,
            localAddress: null,
            serverNameOverwrite: '',
            streamOutputBlockSize: null,
            streamOutputEOFSymbol: null,
            streamOutputPath: null,
            timeoutMilliseconds: 0,
            timeoutSeconds: 60,
            withDebug: false,
            withDefaultCookieJar: true,
            withoutCookieJar: false,
            withRandomTLSExtensionOrder: true,
            retryIsEnabled: true,
            retryMaxCount: 3,
            retryStatusCodes: [408, 429, 500, 502, 503, 504, 521, 522, 523, 524],
            ...options,
        };

        this.sessionId = crypto.randomUUID();
        this.moduleClient = moduleClient;
    }

    private async init(): Promise<void> {
        if (!this.pool) {
            await this.moduleClient.open();
            this.pool = this.moduleClient.pool;
        }
    }

    /**
     * @description Set the default cookies for the SessionClient
     * @param {Cookie[]} cookies - Array of cookies to set as defaults
     * @returns {void}
     */
    setDefaultCookies(cookies: Cookie[]): void {
        this.defaultOptions.defaultCookies = cookies;
    }

    /**
     * @description Set the default headers for the SessionClient
     * @param {Record<string, string>} headers - Object containing header key-value pairs
     * @returns {void}
     */
    setDefaultHeaders(headers: Record<string, string>): void {
        this.defaultOptions.defaultHeaders = headers;
    }

    private combineOptions(options: Partial<TlsClientOptions>): TlsClientOptions {
        const defaultHeaders = this.defaultOptions.defaultHeaders ?? {};
        const headers = {
            ...defaultHeaders,
            ...(options.headers ?? {}),
        };

        const defaultCookies = this.defaultOptions.defaultCookies ?? [];
        const requestCookies = [...defaultCookies, ...(options.requestCookies ?? [])];

        return {
            ...this.defaultOptions,
            ...options,
            headers,
            requestCookies,
            // Remove the headers and cookies from the default options
        };
    }

    private convertBody(body: unknown): string {
        if (typeof body === 'object' || Array.isArray(body)) return JSON.stringify(body);
        return String(body);
    }

    private convertUrl(url: unknown): string {
        if (!url) throw new Error('Missing url parameter');
        return String(url);
    }

    /**
     * @description Gets the session ID if session rotation is not enabled.
     * @returns {string} The session ID, or null if session rotation is enabled.
     */
    getSession(): string {
        return this.sessionId;
    }

    /**
     * @description Destroys the sessionId
     * @param {string} [id=this.sessionId] - The ID associated with the memory to free.
     * @returns {Promise<unknown>} Promise that resolves when the session is destroyed
     */
    async destroySession(id: string = this.sessionId): Promise<unknown> {
        return this.exec('destroySession', [id]);
    }

    private async sendRequest(options: TlsClientOptions): Promise<TlsClientResponse> {
        return this.exec('request', [JSON.stringify(options)]) as Promise<TlsClientResponse>;
    }

    private async retryRequest(options: TlsClientOptions): Promise<TlsClientResponse> {
        let retryCount = 0;
        let response: TlsClientResponse;

        do {
            response = await this.sendRequest(options);
            response.retryCount = retryCount++;
        } while (
            options.retryIsEnabled &&
            (options.retryMaxCount ?? 0) > retryCount &&
            (options.retryStatusCodes ?? []).includes(response.status)
        );

        return response;
    }

    private async request(options: Partial<TlsClientOptions>): Promise<TlsClientResponse> {
        await this.init();

        const combinedOptions = this.combineOptions(options);
        const request = await this.retryRequest(combinedOptions);

        return request;
    }

    /**
     * @description Send a GET request
     * @param {URL|string} url - The URL to send the request to
     * @param {Partial<TlsClientOptions>} [options={}] - The request options
     * @returns {Promise<TlsClientResponse>} The response from the server
     */
    async get(url: URL | string, options: Partial<TlsClientOptions> = {}): Promise<TlsClientResponse> {
        return this.request({
            sessionId: this.sessionId,
            requestUrl: this.convertUrl(url),
            requestMethod: 'GET',
            requestBody: null,
            requestCookies: [],
            ...options,
        });
    }

    /**
     * @description Send a POST request
     * @param {URL|string} url - The URL to send the request to
     * @param {object|string} body - The request body
     * @param {Partial<TlsClientOptions>} [options={}] - The request options
     * @returns {Promise<TlsClientResponse>} The response from the server
     */
    async post(url: URL | string, body: unknown, options: Partial<TlsClientOptions> = {}): Promise<TlsClientResponse> {
        return this.request({
            sessionId: this.sessionId,
            requestUrl: this.convertUrl(url),
            requestMethod: 'POST',
            requestBody: this.convertBody(body),
            requestCookies: [],
            ...options,
        });
    }

    /**
     * @description Send a PUT request
     * @param {URL|string} url - The URL to send the request to
     * @param {object|string} body - The request body
     * @param {Partial<TlsClientOptions>} [options={}] - The request options
     * @returns {Promise<TlsClientResponse>} The response from the server
     */
    async put(url: URL | string, body: unknown, options: Partial<TlsClientOptions> = {}): Promise<TlsClientResponse> {
        return this.request({
            sessionId: this.sessionId,
            requestUrl: this.convertUrl(url),
            requestMethod: 'PUT',
            requestBody: this.convertBody(body),
            requestCookies: [],
            ...options,
        });
    }

    /**
     * @description Send a DELETE request
     * @param {URL|string} url - The URL to send the request to
     * @param {Partial<TlsClientOptions>} [options={}] - The request options
     * @returns {Promise<TlsClientResponse>} The response from the server
     */
    async delete(url: URL | string, options: Partial<TlsClientOptions> = {}): Promise<TlsClientResponse> {
        return this.request({
            sessionId: this.sessionId,
            requestUrl: this.convertUrl(url),
            requestMethod: 'DELETE',
            requestBody: '',
            requestCookies: [],
            ...options,
        });
    }

    /**
     * @description Send a HEAD request
     * @param {URL|string} url - The URL to send the request to
     * @param {Partial<TlsClientOptions>} [options={}] - The request options
     * @returns {Promise<TlsClientResponse>} The response from the server
     */
    async head(url: URL | string, options: Partial<TlsClientOptions> = {}): Promise<TlsClientResponse> {
        return this.request({
            sessionId: this.sessionId,
            requestUrl: this.convertUrl(url),
            requestMethod: 'HEAD',
            requestBody: '',
            requestCookies: [],
            ...options,
        });
    }

    /**
     * @description Send a PATCH request
     * @param {URL|string} url - The URL to send the request to
     * @param {object|string} body - The request body
     * @param {Partial<TlsClientOptions>} [options={}] - The request options
     * @returns {Promise<TlsClientResponse>} The response from the server
     */
    async patch(url: URL | string, body: unknown, options: Partial<TlsClientOptions> = {}): Promise<TlsClientResponse> {
        return this.request({
            sessionId: this.sessionId,
            requestUrl: this.convertUrl(url),
            requestMethod: 'PATCH',
            requestBody: this.convertBody(body),
            requestCookies: [],
            ...options,
        });
    }

    /**
     * @description Send an OPTIONS request
     * @param {URL|string} url - The URL to send the request to
     * @param {Partial<TlsClientOptions>} [options={}] - The request options
     * @returns {Promise<TlsClientResponse>} The response from the server
     */
    async options(url: URL | string, options: Partial<TlsClientOptions> = {}): Promise<TlsClientResponse> {
        return this.request({
            sessionId: this.sessionId,
            requestUrl: this.convertUrl(url),
            requestMethod: 'OPTIONS',
            requestBody: '',
            requestCookies: [],
            ...options,
        });
    }

    /**
     * @description Get the cookies for a given session and URL
     * @param {string} sessionId - The existing session ID.
     * @param {string} url - The URL to get cookies for.
     * @returns {Promise<CookieResponse>} Promise that resolves to the cookie response
     */
    async getCookiesFromSession(sessionId: string, url: string): Promise<CookieResponse> {
        if (!sessionId || !url) throw new Error('Missing sessionId or url parameter');
        await this.init();

        const response = this.exec('getCookiesFromSession', [JSON.stringify({ sessionId, url })]);
        return response as Promise<CookieResponse>;
    }

    /**
     * @deprecated Use requestCookies instead
     * @description Add cookies to a given session
     * @param {string} sessionId - The existing session ID.
     * @param {string} url - The URL to add cookies for.
     * @param {Cookie[]} cookies - The cookies to add.
     * @returns {Promise<CookieResponse>} Promise that resolves to the cookie response
     */
    async addCookiesToSession(sessionId: string, url: string, cookies: Cookie[]): Promise<CookieResponse> {
        if (!sessionId || !url || !cookies) throw new Error('Missing sessionId, url or cookies parameter');
        await this.init();

        const response = this.exec('addCookiesToSession', [JSON.stringify({ sessionId, url, cookies })]);
        return response as Promise<CookieResponse>;
    }

    /**
     * @description Destroy all existing sessions in order to release allocated memory.
     * @returns {Promise<unknown>} Promise that resolves when all sessions are destroyed
     */
    destroyAll(): Promise<unknown> {
        return this.exec('destroyAll', []);
    }

    // Method to exec and then run freeMemory
    private async exec(func: string, args: unknown[]): Promise<unknown> {
        await this.init();

        if (!this.pool) {
            throw new Error('Worker pool not initialized');
        }

        const result = await this.pool.run({
            fn: func,
            args,
        });

        return result;
    }
}

export default { SessionClient, ModuleClient };
export { ModuleClient };
export { type ModuleClientOptions, type PoolStats } from './utils/client.js';
