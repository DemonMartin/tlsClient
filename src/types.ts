type ChromeProfile =
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
    | 'chrome_131_PSK';

type SafariProfile = 'safari_15_6_1' | 'safari_16_0';

type SafariIOSProfile =
    | 'safari_ios_15_5'
    | 'safari_ios_15_6'
    | 'safari_ios_16_0'
    | 'safari_ios_17_0'
    | 'safari_ios_18_0';

type SafariIpadOSProfile = 'safari_ios_15_6';

type FirefoxProfile =
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
    | 'firefox_133';

type OperaProfile = 'opera_89' | 'opera_90' | 'opera_91';

type CustomClientProfile =
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

type BrowserProfile =
    | ChromeProfile
    | SafariProfile
    | SafariIOSProfile
    | SafariIpadOSProfile
    | FirefoxProfile
    | OperaProfile
    | CustomClientProfile;

/**
 * This is an example of how you can supply certificate pinning settings.
 *
 * The key is the host (e.g., "example.com"), and the value is an array of
 * certificate fingerprints (e.g., SHA256 hashes) to pin.
 */
type certificatePinningHosts = {
    [host: string]: string[];
};

type PriorityParam = {
    streamDep: number;
    exclusive: boolean;
    weight: number;
};

type PriorityFrame = {
    streamID: number;
    priorityParam: PriorityParam | null;
};

type CandidateCipherSuite = {
    kdfId: KdfId;
    aeadId: AeadId;
};

type H2SettingsKey =
    | 'HEADER_TABLE_SIZE'
    | 'ENABLE_PUSH'
    | 'MAX_CONCURRENT_STREAMS'
    | 'INITIAL_WINDOW_SIZE'
    | 'MAX_FRAME_SIZE'
    | 'MAX_HEADER_LIST_SIZE';

type SupportedVersion = 'GREASE' | '1.3' | '1.2' | '1.1' | '1.0';

type SupportedSignatureAlgorithm =
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
    | 'Ed25519';

type CertCompressionAlgorithm = 'zlib' | 'brotli' | 'zstd';

type SupportedDelegatedCredential = SupportedSignatureAlgorithm | 'SHA224_RSA' | 'SHA224_ECDSA';

type KeyShareCurve =
    | 'GREASE'
    | 'P256'
    | 'P384'
    | 'P521'
    | 'X25519'
    | 'P256Kyber768'
    | 'X25519Kyber512D'
    | 'X25519Kyber768';

type KdfId = 'HKDF_SHA256' | 'HKDF_SHA384' | 'HKDF_SHA512';

type AeadId = 'AEAD_AES_128_GCM' | 'AEAD_AES_256_GCM' | 'AEAD_CHACHA20_POLY1305';

/**
 * Custom configurable TLS client settings | Might be inaccurate or incomplete
 */
type CustomTLSClient = {
    /** Compression algorithm for the certificate */
    certCompressionAlgo: CertCompressionAlgorithm;
    /** Connection flow */
    connectionFlow: number;
    /** HTTP/2 settings */
    h2Settings: Record<H2SettingsKey, number> | null;
    /** Order of HTTP/2 settings */
    h2SettingsOrder: H2SettingsKey[] | null;
    /** Priority of headers */
    headerPriority: PriorityParam | null;
    /** JA3 string */
    ja3String: string;
    /** Key share curves */
    keyShareCurves: KeyShareCurve[] | null;
    /** Priority frames */
    priorityFrames: PriorityFrame[] | null;
    /** Supported protocols for the ALPN Extension */
    alpnProtocols: string[] | null;
    /** Supported protocols for the ALPS Extension */
    alpsProtocols: string[] | null;
    /** List of ECH Candidate Payloads */
    ECHCandidatePayloads: number[] | null;
    /** ECH Candidate Cipher Suites */
    ECHCandidateCipherSuites: CandidateCipherSuite[] | null;
    /** Order of pseudo headers */
    pseudoHeaderOrder: string[] | null;
    /** Supported algorithms for delegated credentials */
    supportedDelegatedCredentialsAlgorithms: SupportedDelegatedCredential[] | null;
    /** Supported signature algorithms */
    supportedSignatureAlgorithms: SupportedSignatureAlgorithm[] | null;
    /** Supported versions */
    supportedVersions: SupportedVersion[] | null;
};

type TransportOptions = {
    /**
     * If true, keep-alives will be disabled
     * @default false
     */
    disableKeepAlives?: boolean;

    /**
     * If true, compression will be disabled
     * @default false
     */
    disableCompression?: boolean;

    /**
     * Maximum number of idle connections
     * @default 0
     */
    maxIdleConns?: number;

    /**
     * Maximum number of idle connections per host
     * @default 0
     */
    maxIdleConnsPerHost?: number;

    /**
     * Maximum number of connections per host
     * @default 0
     */
    maxConnsPerHost?: number;

    /**
     * Maximum number of response header bytes
     * @default 0
     */
    maxResponseHeaderBytes?: number;

    /**
     * Write buffer size
     * @default 0
     */
    writeBufferSize?: number;

    /**
     * Read buffer size
     * @default 0
     */
    readBufferSize?: number;

    /**
     * Idle connection timeout
     * @default 0
     */
    idleConnTimeout?: number;
};

type Cookie = {
    domain: string;
    expires: string;
    name: string;
    path: string;
    value: string;
};

interface ModuleOptions {
    /** Path to custom library file
     * @default null */
    customLibraryPath?: string | null;

    /** Path to custom library download folder
     * @default null */
    customLibraryDownloadPath?: string | null;
}

type DefaultHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
};

interface SessionClientCustomOptions {
    /** Custom Headers which will be used for all requests additionally to the given headers in the request */
    additionalDefaultHeaders?: Record<string, string> | null;

    /** Enable request retries based on retryStatusCodes
     * @default true */
    retryIsEnabled?: boolean;

    /** Maximum number of retry attempts
     * @default 3 */
    retryMaxCount?: number;

    /** HTTP status codes that trigger a retry
     * @default [408, 429, 500, 502, 503, 504, 521, 522, 523, 524] */
    retryStatusCodes?: number[];
}

interface SessionClientOptions {
    /** Client profile identifier to use for the TLS fingerprint
     * @default 'chrome_131' */
    tlsClientIdentifier?: BrowserProfile;

    /** Whether to catch panic errors
     * @default false */
    catchPanics?: boolean;

    /** Certificate pinning configuration
     * @default null */
    certificatePinningHosts?: certificatePinningHosts | null;

    /** Custom TLS client configuration
     * @default null */
    customTlsClient?: CustomTLSClient | null;

    /** Transport layer options
     * @default null */
    transportOptions?: TransportOptions | null;

    /** Whether to follow HTTP redirects
     * @default false */
    followRedirects?: boolean;

    /** Force HTTP/1.1 protocol
     * @default false */
    forceHttp1?: boolean;

    /** Order of HTTP headers
     * @default ["host", "user-agent", "accept", "accept-language", "accept-encoding", "connection", "upgrade-insecure-requests", "if-modified-since", "cache-control", "dnt", "content-length", "content-type", "range", "authorization", "x-real-ip", "x-forwarded-for", "x-requested-with", "x-csrf-token", "x-request-id", "sec-ch-ua", "sec-ch-ua-mobile", "sec-ch-ua-platform", "sec-fetch-dest", "sec-fetch-mode", "sec-fetch-site", "origin", "referer", "pragma", "max-forwards", "x-http-method-override", "if-unmodified-since", "if-none-match", "if-match", "if-range", "accept-datetime"] */
    headerOrder?: string[];

    /** Default Headers to be used when no request headers are specified. Default headers are matching with the default tls client identifier.
     */
    defaultHeaders?: DefaultHeaders | Record<string, string> | null;

    /** Headers used for CONNECT requests
     * @default null */
    connectHeaders?: Record<string, string> | null;

    /** Skip TLS certificate verification | Cannot be changed during a session
     * @default false */
    insecureSkipVerify?: boolean;

    /** Handle request body as bytes | When you set isByteRequest to true the request body needs to be a base64 encoded string. Useful when you want to upload images for example.
     * @default false */
    isByteRequest?: boolean;

    /** Handle response body as bytes | When you set isByteResponse to true the response body will be a base64 encoded string. Useful when you want to download images for example.
     * @default false */
    isByteResponse?: boolean;

    /** Whether proxy is rotating
     * @default false */
    isRotatingProxy?: boolean;

    /** Proxy URL (format: http://user:pass@host:port)
     * @default null */
    proxyUrl?: string | null;

    /** Disable IPv6 connections
     * @default false */
    disableIPV6?: boolean;

    /** Disable IPv4 connections
     * @default false */
    disableIPV4?: boolean;

    /** Local address binding [not Sure? Docs are not clear]
     * @default null */
    localAddress?: null;

    /** Server name for TLS SNI | Lookup https://bogdanfinn.gitbook.io/open-source-oasis/tls-client/client-options
     * @default '' */
    serverNameOverwrite?: string;

    /** Stream output block size
     * @default null */
    streamOutputBlockSize?: null;

    /** EOF symbol of the stream output
     * @default null */
    streamOutputEOFSymbol?: null;

    /** Stream output path
     * @default null */
    streamOutputPath?: null;

    /** Request timeout in milliseconds
     * @default 0 */
    timeoutMilliseconds?: number;

    /** Request timeout in seconds | Cannot be changed during a session
     * @default 60 */
    timeoutSeconds?: number;

    /** Enable debug logging
     * @default false */
    withDebug?: boolean;

    /** Use default cookie jar
     * @default true */
    withDefaultCookieJar?: boolean;

    /** Disable cookie jar
     * @default false */
    withoutCookieJar?: boolean;

    /** Randomize TLS extension order [Must be true]
     * @default true */
    withRandomTLSExtensionOrder?: boolean;
}

/**
 * Default options for configuring the TLS client session
 */
interface SessionClientDefaultOptions {}
