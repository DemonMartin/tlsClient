import Client from './utils/client.js';
import crypto from 'node:crypto';

/**
 * @typedef {"chrome_103"|"chrome_104"|"chrome_105"|"chrome_106"|"chrome_107"|"chrome_108"|"chrome_109"|"chrome_110"|"chrome_111"|"chrome_112"|"chrome_116_PSK"|"chrome_116_PSK_PQ"|"chrome_117"|"chrome_120"|"chrome_124"} ChromeProfile
 */

/**
 * @typedef {"safari_15_6_1"|"safari_16_0"} SafariProfile
 */

/**
 * @typedef {"safari_ios_15_5"|"safari_ios_15_6"|"safari_ios_16_0"} SafariIOSProfile
 */

/**
 * @typedef {"safari_ios_15_6"} SafariIpadOSProfile
 */

/**
 * @typedef {"firefox_102"|"firefox_104"|"firefox_105"|"firefox_106"|"firefox_108"|"firefox_110"|"firefox_117"|"firefox_120"|"firefox_123"} FirefoxProfile
 */

/**
 * @typedef {"opera_89"|"opera_90"|"opera_91"} OperaProfile
 */

/**
 * @typedef {"zalando_ios_mobile"|"nike_ios_mobile"|"cloudscraper"|"mms_ios"|"mms_ios_1"|"mms_ios_2"|"mms_ios_3"|"mesh_ios"|"mesh_ios_1"|"confirmed_ios"} CustomClientProfile
 */

/**
 * @typedef {ChromeProfile|SafariProfile|SafariIOSProfile|SafariIpadOSProfile|FirefoxProfile|OperaProfile|CustomClientProfile} ClientProfile
 */

/**
 * @typedef {Object} certificatePinningHosts
 * @property {string[]} example.com - This is an example how you can supply certificate pinning settings
 */

/**
 * @description This is unfinished and should be updated in the future, to be better and more accurate
 * @typedef {Object} CustomTLSClient
 * @property {string} certCompressionAlgo - Compression algorithm for the certificate
 * @property {number} connectionFlow - Connection flow
 * @property {Object.<string, number>} h2Settings - HTTP/2 settings
 * @property {string[]} h2SettingsOrder - Order of HTTP/2 settings
 * @property {PriorityParam} headerPriority - Priority of headers
 * @property {string} ja3String - JA3 string
 * @property {string[]} keyShareCurves - Key share curves
 * @property {PriorityFrames[]} priorityFrames - Priority frames
 * @property {string[]} alpnProtocols - Supported protocols for the ALPN Extension
 * @property {string[]} alpsProtocols - Supported protocols for the ALPS Extension
 * @property {number[]} ECHCandidatePayloads - List of ECH Candidate Payloads
 * @property {CanidateCipherSuite[]} ECHCandidateCipherSuites - ECH Candidate Cipher Suites
 * @property {string[]} pseudoHeaderOrder - Order of pseudo headers
 * @property {string[]} supportedDelegatedCredentialsAlgorithms - Supported algorithms for delegated credentials
 * @property {string[]} supportedSignatureAlgorithms - Supported signature algorithms
 * @property {string[]} supportedVersions - Supported versions
 */

/**
 * @typedef {Object} TransportOptions
 * @property {boolean} [disableKeepAlives=false] - If true, keep-alives will be disabled
 * @property {boolean} [disableCompression=false] - If true, compression will be disabled
 * @property {number} [maxIdleConns=0] - Maximum number of idle connections
 * @property {number} [maxIdleConnsPerHost=0] - Maximum number of idle connections per host
 * @property {number} [maxConnsPerHost=0] - Maximum number of connections per host
 * @property {number} [maxResponseHeaderBytes=0] - Maximum number of response header bytes
 * @property {number} [writeBufferSize=0] - Write buffer size
 * @property {number} [readBufferSize=0] - Read buffer size
 * @property {number} [idleConnTimeout=0] - Idle connection timeout
 */

/**
 * @typedef {Object} Cookie
 * @property {string} domain - The domain of the cookie
 * @property {number} expires - The expiration time of the cookie
 * @property {string} name - The name of the cookie
 * @property {string} path - The path of the cookie
 * @property {string} value - The value of the cookie
 */

/**
 * @typedef {Object} TlsClientDefaultOptions
 * @property {ClientProfile} [tlsClientIdentifier='chrome_124'] - Identifier of the TLS client
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
 * @property {Cookie[]|null} requestCookies - Cookies of the request
 * @property {Object|null} defaultHeaders - Default headers
 * @property {boolean} disableIPV6 - If true, IPV6 will be disabled
 * @property {null} localAddress - Local address
 * @property {String|null} sessionId - ID of the session
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

/**
 * @typedef {Object} GetCookiesInput
 * @property {string} sessionId - The existing session ID.
 * @property {string} url - The URL to get cookies for.
 */

/**
 * @typedef {Object} AddCookiesInput
 * @property {string} sessionId - The existing session ID.
 * @property {string} url - The URL to add cookies for.
 * @property {Cookie[]|null} cookie - The cookies to add.
 */

/**
 * @typedef {Object} CookieResponse
 * @property {Cookie[]|null} cookies - The cookies of the response
 */

/**
 * @class TlsClient
 */
class TlsClient {
    /**
     * @description Create a new TlsClient
     * @param {TlsClientDefaultOptions} options
     */
    constructor(options) {
        /**
         * @type {TlsClientDefaultOptions}
         */
        this.defaultOptions = {
            tlsClientIdentifier: 'chrome_124',
            catchPanics: false,
            certificatePinningHosts: null,
            customTlsClient: null,
            customLibraryPath: null,
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
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
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
            customLibraryDownloadPath: null,
            ...options,
        };

        this.sessionId = crypto.randomUUID();
        this.client = new Client(options);
    }

    async #init() {
        if (!this.pool) {
            await this.client.open();
            this.pool = this.client.startWorkerPool();
        }
    }

    /**
     * @description Set the default cookies for the TlsClient
     * @param {Cookie[]} cookies
     * @returns
     */
    setDefaultCookies(cookies) {
        this.defaultOptions.defaultCookies = cookies;
    }

    /**
     * @description Set the default headers for the TlsClient
     * @param {Headers} headers
     * @returns
     */
    setDefaultHeaders(headers) {
        this.defaultOptions.defaultHeaders = headers;
    }

    #combineOptions(options) {
        const defaultHeaders = this.defaultOptions.defaultHeaders || {};
        const headers = {
            ...defaultHeaders,
            ...(options.headers || {}),
        };

        const defaultCookies = this.defaultOptions.defaultCookies || [];
        const requestCookies = [...defaultCookies, ...(options.requestCookies || [])];

        return {
            ...this.defaultOptions,
            ...options,
            headers,
            requestCookies,

            // Remove the headers and cookies from the default options
            defaultCookies: undefined,
            defaultHeaders: undefined,
        };
    }

    #convertBody(body) {
        if (typeof body === 'object' || Array.isArray(body)) return JSON.stringify(body);
        return body.toString();
    }

    #convertUrl(url) {
        if (!url) throw new Error('Missing url parameter');
        return url.toString();
    }

    /**
     * @description Terminate the TlsClient WorkerPool
     */
    terminate() {
        try {
            this.destroySession();
            this.client?.lib?.unload?.();
            return this.pool?.terminate?.();
        } catch (error) {
            return undefined;
        }
    }

    /**
     * @description Gets the session ID if session rotation is not enabled.
     * @returns {string|null} The session ID, or null if session rotation is enabled.
     */
    getSession() {
        return this.sessionId;
    }

    /**
     * @description Destroys the sessionId
     * @param {string} [id=this.sessionId] - The ID associated with the memory to free.
     * @returns {}
     */
    async destroySession(id = this.sessionId) {
        return await this.pool.exec('destroySession', [id]);
    }

    /**
     * @description Frees memory associated with a given ID.
     * @param {string} id - The ID associated with the memory to free.
     * @returns {Promise} A promise that resolves when the memory has been freed.
     */
    async #freeMemory(id) {
        return await this.pool.exec('freeMemory', [id]);
    }

    async sendRequest(options) {
        const request = JSON.parse(await this.pool.exec('request', [JSON.stringify(options)]));
        await this.#freeMemory(request.id);

        // Remove the id from the response | Useless for user
        delete request.id;

        return request;
    }

    async #retryRequest(options) {
        let retryCount = 0;
        let response;

        do {
            response = await this.sendRequest(options);
            response.retryCount = retryCount++;
        } while (
            options.retryIsEnabled &&
            options.retryMaxCount > retryCount &&
            options.retryStatusCodes.includes(response.status)
        );

        return response;
    }

    async #request(options) {
        await this.#init();

        const combinedOptions = this.#combineOptions(options);
        const request = await this.#retryRequest(combinedOptions);

        return request;
    }

    /**
     * @description Send a GET request
     * @param {URL|string} url
     * @param {TlsClientOptions} options
     * @returns {Promise<TlsClientResponse>}
     */
    async get(url, options = {}) {
        return this.#request({
            sessionId: this.sessionId,
            requestUrl: this.#convertUrl(url),
            requestMethod: 'GET',
            requestBody: null,
            requestCookies: [],
            ...options,
        });
    }

    /**
     * @description Send a POST request
     * @param {URL|string} url
     * @param {JSON|string} body
     * @param {TlsClientOptions} options
     * @returns {Promise<TlsClientResponse>}
     */
    async post(url, body, options = {}) {
        if (typeof body === 'object') body = JSON.stringify(body);
        if (typeof body !== 'string') body = body.toString();

        return this.#request({
            sessionId: this.sessionId,
            requestUrl: this.#convertUrl(url),
            requestMethod: 'POST',
            requestBody: this.#convertBody(body),
            requestCookies: [],
            ...options,
        });
    }

    /**
     * @description Send a PUT request
     * @param {URL|string} url
     * @param {JSON|string} body
     * @param TlsClientOptions} options
     * @returns {Promise<TlsClientResponse>}
     */
    async put(url, body, options = {}) {
        return this.#request({
            sessionId: this.sessionId,
            requestUrl: this.#convertUrl(url),
            requestMethod: 'PUT',
            requestBody: this.#convertBody(body),
            requestCookies: [],
            ...options,
        });
    }

    /**
     * @description Send a DELETE request
     * @param {URL|string} url
     * @param {TlsClientOptions} options
     * @returns {Promise<TlsClientResponse>}
     */
    async delete(url, options = {}) {
        return this.#request({
            sessionId: this.sessionId,
            requestUrl: this.#convertUrl(url),
            requestMethod: 'DELETE',
            requestBody: '',
            requestCookies: [],
            ...options,
        });
    }

    /**
     * @description Send a HEAD request
     * @param {URL|string} url
     * @param {TlsClientOptions} options
     * @returns {Promise<TlsClientResponse>}
     */
    async head(url, options = {}) {
        return this.#request({
            sessionId: this.sessionId,
            requestUrl: this.#convertUrl(url),
            requestMethod: 'HEAD',
            requestBody: '',
            requestCookies: [],
            ...options,
        });
    }

    /**
     * @description Send a PATCH request
     * @param {URL|string} url
     * @param {JSON|string} body
     * @param {TlsClientOptions} options
     * @returns {Promise<TlsClientResponse>}
     */
    async patch(url, body, options = {}) {
        return this.#request({
            sessionId: this.sessionId,
            requestUrl: this.#convertUrl(url),
            requestMethod: 'PATCH',
            requestBody: this.#convertBody(body),
            requestCookies: [],
            ...options,
        });
    }

    /**
     * @description Send a OPTIONS request
     * @param {URL|string} url
     * @param {TlsClientOptions} options
     * @returns {Promise<TlsClientResponse>}
     */
    async options(url, options = {}) {
        return this.#request({
            sessionId: this.sessionId,
            requestUrl: this.#convertUrl(url),
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
     * @returns {Promise<CookieResponse>}
     */
    async getCookiesFromSession(sessionId, url) {
        if (!sessionId || !url) throw new Error('Missing sessionId or url parameter');
        const response = JSON.parse(
            await this.pool.exec('getCookiesFromSession', [JSON.stringify({ sessionId, url })])
        );
        await this.#freeMemory(response.id);
        delete response.id;

        return response;
    }

    /**
     * @deprecated Use requestCookies instead
     * @description Add cookies to a given session
     * @param {string} sessionId - The existing session ID.
     * @param {string} url - The URL to add cookies for.
     * @param {Cookie[]} cookie - The cookies to add.
     * @returns {Promise<CookieResponse>}
     */
    async addCookiesToSession(sessionId, url, cookies) {
        if (!sessionId || !url || !cookies) throw new Error('Missing sessionId, url or cookies parameter');
        const response = JSON.parse(
            await this.pool.exec('addCookiesToSession', [JSON.stringify({ sessionId, url, cookies })])
        );
        await this.#freeMemory(response.id);
        delete response.id;

        return response;
    }

    /**
     * @description Rotate the session ID. [Warning: This will NOT destroy the previous session, call destroySession first]
     * @returns {string} The new session ID.
     */
    rotateSession() {
        this.sessionId = crypto.randomUUID();
        return this.sessionId;
    }

    /**
     * @description Destroy all existing sessions in order to release allocated memory.
     * @returns {}
     */
    destroyAll() {
        return this.pool.exec('destroyAll', []);
    }
}
export default TlsClient;
