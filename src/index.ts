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
    | 'chrome_130_PSK'
    | 'chrome_131'
    | 'chrome_131_PSK'
    | 'chrome_133'
    | 'chrome_133_PSK'
    | 'chrome_144'
    | 'chrome_144_PSK'
    | 'chrome_146'
    | 'chrome_146_PSK';

export type SafariProfile = 'safari_15_6_1' | 'safari_16_0';

export type SafariIOSProfile =
    | 'safari_ios_15_5'
    | 'safari_ios_15_6'
    | 'safari_ios_16_0'
    | 'safari_ios_17_0'
    | 'safari_ios_18_0'
    | 'safari_ios_18_5'
    | 'safari_ios_26_0';

export type SafariIpadOSProfile = 'safari_ipad_15_6';

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
    | 'firefox_135'
    | 'firefox_146_PSK'
    | 'firefox_147'
    | 'firefox_147_PSK';

export type OperaProfile = 'opera_89' | 'opera_90' | 'opera_91';

export type OkHttp4Profile =
    | 'okhttp4_android_7'
    | 'okhttp4_android_8'
    | 'okhttp4_android_9'
    | 'okhttp4_android_10'
    | 'okhttp4_android_11'
    | 'okhttp4_android_12'
    | 'okhttp4_android_13';

export type CustomClientProfile =
    | 'zalando_ios_mobile'
    | 'zalando_android_mobile'
    | 'nike_ios_mobile'
    | 'nike_android_mobile'
    | 'cloudscraper'
    | 'mms_ios'
    | 'mms_ios_1'
    | 'mms_ios_2'
    | 'mms_ios_3'
    | 'mesh_ios'
    | 'mesh_ios_1'
    | 'mesh_ios_2'
    | 'mesh_android'
    | 'mesh_android_1'
    | 'mesh_android_2'
    | 'confirmed_ios'
    | 'confirmed_android';

export type ClientProfile =
    | ChromeProfile
    | SafariProfile
    | SafariIOSProfile
    | SafariIpadOSProfile
    | FirefoxProfile
    | OperaProfile
    | OkHttp4Profile
    | CustomClientProfile;

/**
 * Certificate compression algorithm types
 */
export type CertCompressionAlgorithm = 'zlib' | 'brotli' | 'zstd';

/**
 * HTTP/2 settings keys
 */
export type H2SettingsKey =
    | 'HEADER_TABLE_SIZE'
    | 'ENABLE_PUSH'
    | 'MAX_CONCURRENT_STREAMS'
    | 'INITIAL_WINDOW_SIZE'
    | 'MAX_FRAME_SIZE'
    | 'MAX_HEADER_LIST_SIZE'
    | 'UNKNOWN_SETTING_7'
    | 'UNKNOWN_SETTING_8'
    | 'UNKNOWN_SETTING_9';

/**
 * HTTP/3 settings keys
 */
export type H3SettingsKey =
    | 'QPACK_MAX_TABLE_CAPACITY'
    | 'MAX_FIELD_SECTION_SIZE'
    | 'QPACK_BLOCKED_STREAMS'
    | 'H3_DATAGRAM';

/**
 * Supported TLS versions
 */
export type SupportedVersion = 'GREASE' | '1.3' | '1.2' | '1.1' | '1.0';

/**
 * Supported signature algorithms
 */
export type SignatureAlgorithm =
    | 'PKCS1WithSHA256'
    | 'PKCS1WithSHA384'
    | 'PKCS1WithSHA512'
    | 'PSSWithSHA256'
    | 'PSSWithSHA384'
    | 'PSSWithSHA512'
    | 'ECDSAWithP256AndSHA256'
    | 'ECDSAWithP384AndSHA384'
    | 'ECDSAWithP521AndSHA512'
    | 'PKCS1WithSHA1'
    | 'ECDSAWithSHA1'
    | 'Ed25519'
    | 'SHA224_RSA'
    | 'SHA224_ECDSA';

/**
 * Key share curves
 */
export type KeyShareCurve =
    | 'GREASE'
    | 'P256'
    | 'P384'
    | 'P521'
    | 'X25519'
    | 'P256Kyber768'
    | 'X25519Kyber512D'
    | 'X25519Kyber768'
    | 'X25519Kyber768Old'
    | 'X25519MLKEM768';

/**
 * KDF identifiers
 */
export type KdfId = 'HKDF_SHA256' | 'HKDF_SHA384' | 'HKDF_SHA512';

/**
 * AEAD identifiers
 */
export type AeadId = 'AEAD_AES_128_GCM' | 'AEAD_AES_256_GCM' | 'AEAD_CHACHA20_POLY1305';

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
    streamDep?: number;
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
export interface CandidateCipherSuite {
    kdfId: KdfId;
    aeadId: AeadId;
}

/**
 * Custom TLS client configuration for advanced fingerprint customization
 */
export interface CustomTLSClient {
    /** Certificate compression algorithms */
    certCompressionAlgos?: CertCompressionAlgorithm[];
    /** Connection flow identifier */
    connectionFlow?: number;
    /** HTTP/2 settings map */
    h2Settings?: Record<H2SettingsKey, number>;
    /** Array of H2Settings keys in order */
    h2SettingsOrder?: H2SettingsKey[];
    /** HTTP/3 settings map */
    h3Settings?: Record<H3SettingsKey, number>;
    /** Array of H3Settings keys in order */
    h3SettingsOrder?: H3SettingsKey[];
    /** Pseudo header order for HTTP/3 requests */
    h3PseudoHeaderOrder?: string[];
    /** HTTP/3 priority parameter */
    h3PriorityParam?: number;
    /** Whether to send GREASE frames in HTTP/3 */
    h3SendGreaseFrames?: boolean;
    /** Priority parameters for headers */
    headerPriority?: PriorityParam;
    /** JA3 fingerprint string */
    ja3String?: string;
    /** Key share curves */
    keyShareCurves?: KeyShareCurve[];
    /** Array of priority frames configuration */
    priorityFrames?: PriorityFrames[];
    /** List of supported protocols for the ALPN Extension */
    alpnProtocols?: string[];
    /** List of supported protocols for the ALPS Extension */
    alpsProtocols?: string[];
    /** List of ECH Candidate Payloads */
    ECHCandidatePayloads?: number[];
    /** ECH Candidate Cipher Suites */
    ECHCandidateCipherSuites?: CandidateCipherSuite[];
    /** Order of pseudo headers */
    pseudoHeaderOrder?: string[];
    /** Supported algorithms for delegated credentials */
    supportedDelegatedCredentialsAlgorithms?: SignatureAlgorithm[];
    /** Supported signature algorithms */
    supportedSignatureAlgorithms?: SignatureAlgorithm[];
    /** Supported TLS versions */
    supportedVersions?: SupportedVersion[];
    /** TLS record size limit extension value */
    recordSizeLimit?: number;
    /** Initial HTTP/2 stream ID */
    streamId?: number;
    /** Allow plaintext HTTP connections */
    allowHttp?: boolean;
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
    /** The expiration time of the cookie (Unix timestamp) */
    expires: number;
    /** Number of seconds the cookie is valid. If both expires and maxAge are set, maxAge has precedence */
    maxAge?: number;
    /** The name of the cookie */
    name: string;
    /** The path of the cookie */
    path: string;
    /** The value of the cookie */
    value: string;
    /** Whether the cookie should only be sent over HTTPS */
    secure?: boolean;
    /** Whether the cookie is inaccessible to client-side scripts */
    httpOnly?: boolean;
}

/**
 * Default options for TLS client configuration
 */
export interface TlsClientDefaultOptions {
    /** Identifier of the TLS client (default: 'chrome_146') */
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
    /** If true, HTTP/3 will be disabled (default: false) */
    disableHttp3?: boolean;
    /** If true, races HTTP/3 (QUIC) and HTTP/2 (TCP) connections in parallel (default: false) */
    withProtocolRacing?: boolean;
    /** Order of headers */
    headerOrder?: string[];
    /** Default headers which will be used in every request */
    defaultHeaders?: Record<string, string> | null;
    /** Headers to be used during the CONNECT request */
    connectHeaders?: Record<string, string[]> | null;
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
    /** Override the request host */
    requestHostOverride?: string | null;
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
    /** If true, the old tls-client custom cookie jar is used instead of Go's default jar (default: false) */
    withCustomCookieJar?: boolean;
    /** If true, the cookie jar is not used (default: false) */
    withoutCookieJar?: boolean;
    /** If true, the order of TLS extensions is randomized (default: true) */
    withRandomTLSExtensionOrder?: boolean;
    /** If true, the response body will be decoded using EUC-KR encoding (default: false) */
    euckrResponse?: boolean;
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
    /** The protocol used for the request (e.g. "h2", "HTTP/2.0", "HTTP/1.1") */
    usedProtocol?: string;
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
    public defaultOptions: TlsClientDefaultOptions;
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
                'ModuleClient must be provided. Please create a new ModuleClient instance and pass it as the first argument.',
            );
        }

        if (!(moduleClient instanceof ModuleClient)) {
            throw new Error('ModuleClient must be an instance of ModuleClient');
        }

        this.defaultOptions = {
            tlsClientIdentifier: 'chrome_146',
            catchPanics: false,
            certificatePinningHosts: null,
            customTlsClient: null,
            customLibraryDownloadPath: null,
            transportOptions: null,
            followRedirects: false,
            forceHttp1: false,
            disableHttp3: false,
            withProtocolRacing: false,
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
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
            },
            connectHeaders: null,
            insecureSkipVerify: false,
            isByteRequest: false,
            isByteResponse: false,
            isRotatingProxy: false,
            proxyUrl: null,
            defaultCookies: null,
            requestHostOverride: null,
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
            withCustomCookieJar: false,
            withoutCookieJar: false,
            withRandomTLSExtensionOrder: true,
            euckrResponse: false,
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
    public setDefaultCookies(cookies: Cookie[]): void {
        this.defaultOptions.defaultCookies = cookies;
    }

    /**
     * @description Set the default headers for the SessionClient
     * @param {Record<string, string>} headers - Object containing header key-value pairs
     * @returns {void}
     */
    public setDefaultHeaders(headers: Record<string, string>): void {
        this.defaultOptions.defaultHeaders = headers;
    }

    private combineOptions(options: Partial<TlsClientOptions>): TlsClientOptions {
        // Merge default headers with request headers
        const headers = {
            ...this.defaultOptions.defaultHeaders,
            ...options.headers,
        };

        // Merge default cookies with request cookies
        const requestCookies = [...(this.defaultOptions.defaultCookies ?? []), ...(options.requestCookies ?? [])];

        // Exclude defaultHeaders and defaultCookies from being sent to Go backend
        const {
            defaultHeaders: _defaultHeaders,
            defaultCookies: _defaultCookies,
            ...baseOptions
        } = this.defaultOptions;

        return {
            ...baseOptions,
            ...options,
            headers,
            requestCookies,
        };
    }

    private convertBody(body: unknown): string {
        if (typeof body === 'object' || Array.isArray(body)) {
            return JSON.stringify(body);
        }
        if (typeof body === 'string') {
            return body;
        }
        if (typeof body === 'number' || typeof body === 'boolean' || typeof body === 'bigint') {
            return String(body);
        }
        if (typeof body === 'symbol') {
            return body.toString();
        }
        if (body === undefined) {
            return 'undefined';
        }
        throw new Error('Unsupported request body type');
    }

    private convertUrl(url: unknown): string {
        if (url instanceof URL) {
            return url.toString();
        }
        if (typeof url === 'string') {
            return url;
        }
        if (!url) {
            throw new Error('Missing url parameter');
        }
        throw new Error('Invalid url type');
    }

    /**
     * @description Gets the session ID if session rotation is not enabled.
     * @returns {string} The session ID, or null if session rotation is enabled.
     */
    public getSession(): string {
        return this.sessionId;
    }

    /**
     * @description Destroys the sessionId
     * @param {string} [id=this.sessionId] - The ID associated with the memory to free.
     * @returns {Promise<unknown>} Promise that resolves when the session is destroyed
     */
    public async destroySession(id: string = this.sessionId): Promise<unknown> {
        return await this.exec('destroySession', [id]);
    }

    private async sendRequest(options: TlsClientOptions): Promise<TlsClientResponse> {
        const {
            retryIsEnabled: _retryIsEnabled,
            retryMaxCount: _retryMaxCount,
            retryStatusCodes: _retryStatusCodes,
            customLibraryDownloadPath: _customLibraryDownloadPath,
            ...goOptions
        } = options;

        return (await this.exec('request', [JSON.stringify(goOptions)])) as TlsClientResponse;
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
    public async get(url: URL | string, options: Partial<TlsClientOptions> = {}): Promise<TlsClientResponse> {
        return await this.request({
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
    public async post(
        url: URL | string,
        body: unknown,
        options: Partial<TlsClientOptions> = {},
    ): Promise<TlsClientResponse> {
        return await this.request({
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
    public async put(
        url: URL | string,
        body: unknown,
        options: Partial<TlsClientOptions> = {},
    ): Promise<TlsClientResponse> {
        return await this.request({
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
    public async delete(url: URL | string, options: Partial<TlsClientOptions> = {}): Promise<TlsClientResponse> {
        return await this.request({
            sessionId: this.sessionId,
            requestUrl: this.convertUrl(url),
            requestMethod: 'DELETE',
            requestBody: null,
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
    public async head(url: URL | string, options: Partial<TlsClientOptions> = {}): Promise<TlsClientResponse> {
        return await this.request({
            sessionId: this.sessionId,
            requestUrl: this.convertUrl(url),
            requestMethod: 'HEAD',
            requestBody: null,
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
    public async patch(
        url: URL | string,
        body: unknown,
        options: Partial<TlsClientOptions> = {},
    ): Promise<TlsClientResponse> {
        return await this.request({
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
    public async options(url: URL | string, options: Partial<TlsClientOptions> = {}): Promise<TlsClientResponse> {
        return await this.request({
            sessionId: this.sessionId,
            requestUrl: this.convertUrl(url),
            requestMethod: 'OPTIONS',
            requestBody: null,
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
    public async getCookiesFromSession(sessionId: string, url: string): Promise<CookieResponse> {
        if (!sessionId || !url) throw new Error('Missing sessionId or url parameter');
        await this.init();

        return (await this.exec('getCookiesFromSession', [JSON.stringify({ sessionId, url })])) as CookieResponse;
    }

    /**
     * @deprecated Use requestCookies instead
     * @description Add cookies to a given session
     * @param {string} sessionId - The existing session ID.
     * @param {string} url - The URL to add cookies for.
     * @param {Cookie[]} cookies - The cookies to add.
     * @returns {Promise<CookieResponse>} Promise that resolves to the cookie response
     */
    public async addCookiesToSession(sessionId: string, url: string, cookies: Cookie[]): Promise<CookieResponse> {
        if (!sessionId || !url || !cookies) throw new Error('Missing sessionId, url or cookies parameter');
        await this.init();

        return (await this.exec('addCookiesToSession', [
            JSON.stringify({ sessionId, url, cookies }),
        ])) as CookieResponse;
    }

    /**
     * @description Destroy all existing sessions in order to release allocated memory.
     * @returns {Promise<unknown>} Promise that resolves when all sessions are destroyed
     */
    public destroyAll(): Promise<unknown> {
        return this.exec('destroyAll', []);
    }

    // Method to exec and then run freeMemory
    private async exec(func: string, args: unknown[]): Promise<unknown> {
        await this.init();

        if (!this.pool) {
            throw new Error('Worker pool not initialized');
        }

        return (await this.pool.run({
            fn: func,
            args,
        })) as unknown;
    }
}

export default { SessionClient, ModuleClient };
export { ModuleClient };
export { type ModuleClientOptions, type PoolStats } from './utils/client.js';
