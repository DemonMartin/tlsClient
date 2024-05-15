import crypto from 'node:crypto';

import ffiRs from 'ffi-rs';
import TlsDependency from './utils/path.js';
import path from 'node:path';
import fs from 'node:fs';
import fetch from 'node-fetch';

process.env.RUST_BACKTRACE = 'full';

class Client {
    isLoaded = false;
    constructor(options) {
        this.customPath = options?.customLibraryPath ? true : false;
        this.tlsDependency = new TlsDependency();
        this.tlsDependencyPath = this.tlsDependency.getTLSDependencyPath(options?.customLibraryDownloadPath);
        this.TLS_LIB_PATH = this.customPath ? options?.customLibraryPath : this.tlsDependencyPath?.TLS_LIB_PATH;
    }

    libraryExists() {
        return fs.existsSync(path.join(this.TLS_LIB_PATH));
    }

    async downloadLibrary() {
        if (this.libraryExists()) return;
        if (this.customPath) {
            throw new Error('Custom path provided but library does not exist: ' + this.TLS_LIB_PATH);
        }

        console.log('[tlsClient] Detected missing TLS library')
        console.log('[tlsClient] DownloadPath: ' + this.tlsDependencyPath.DOWNLOAD_PATH);
        console.log('[tlsClient] DestinationPath: ' + this.TLS_LIB_PATH);
        console.log('[tlsClient] Downloading TLS library... This may take a while');

        const response = await fetch(this.tlsDependencyPath.DOWNLOAD_PATH);

        if (!response.ok) {
            throw new Error(`Unexpected response ${response.statusText}`);
        }

        const fileStream = fs.createWriteStream(this.TLS_LIB_PATH);
        response.body.pipe(fileStream);

        return new Promise((resolve, reject) => {
            fileStream.on('finish', () => {
                console.log('[tlsClient] Successfully downloaded TLS library');
                resolve();
            });
            fileStream.on('error', reject);
        });
    }

    async open() {
        await this.downloadLibrary();

        ffiRs.open({
            library: 'tls',
            path: this.TLS_LIB_PATH
        })

        this.isLoaded = true;
    }

    request(payload) {
        if (!this.isLoaded) throw new Error('Library not loaded');
        return ffiRs.load({
            library: 'tls',
            funcName: 'request',
            retType: 0,
            paramsType: [0],
            paramsValue: [payload]
        })
    }

    getCookiesFromSession(payload) {
        if (!this.isLoaded) throw new Error('Library not loaded');
        return ffiRs.load({
            library: 'tls',
            funcName: 'getCookiesFromSession',
            retType: 0,
            paramsType: [0],
            paramsValue: [payload]
        })
    }

    addCookiesToSession(payload) {
        if (!this.isLoaded) throw new Error('Library not loaded');
        return ffiRs.load({
            library: 'tls',
            funcName: 'addCookiesToSession',
            retType: 0,
            paramsType: [0],
            paramsValue: [payload]
        })
    }

    freeMemory(payload) {
        if (!this.isLoaded) throw new Error('Library not loaded');
        return ffiRs.load({
            library: 'tls',
            funcName: 'freeMemory',
            retType: 2,
            paramsType: [0],
            paramsValue: [payload]
        })
    }

    destroyAll() {
        if (!this.isLoaded) throw new Error('Library not loaded');
        return ffiRs.load({
            library: 'tls',
            funcName: 'destroyAll',
            retType: 0,
            paramsType: [],
            paramsValue: []
        })
    }

    destroySession(payload) {
        if (!this.isLoaded) throw new Error('Library not loaded');
        return ffiRs.load({
            library: 'tls',
            funcName: 'destroySession',
            retType: 0,
            paramsType: [0],
            paramsValue: [payload]
        })
    }

    close() {
        ffiRs.close('tls');

        this.isLoaded = false;
    }
}

/**
 * @class TlsClient
 */
class TlsClient {
    /**
     * @type {Client}
     */
    static libClient = null;

    /**
     * @description Create a new TlsClient
     * @param {import('./typedefs.js').TlsClientDefaultOptions} options 
     */
    constructor(options) {
        /**
         * @type {import('./typedefs.js').TlsClientDefaultOptions}
         */
        this.defaultOptions = {
            tlsClientIdentifier: 'chrome_120',
            rotateSessions: false,
            catchPanics: false,
            certificatePinningHosts: null,
            customTlsClient: null,
            customLibraryPath: null,
            transportOptions: null,
            followRedirects: false,
            forceHttp1: false,
            headerOrder: ["host", "user-agent", "accept", "accept-language", "accept-encoding", "connection", "upgrade-insecure-requests", "if-modified-since", "cache-control", "dnt", "content-length", "content-type", "range", "authorization", "x-real-ip", "x-forwarded-for", "x-requested-with", "x-csrf-token", "x-request-id", "sec-ch-ua", "sec-ch-ua-mobile", "sec-ch-ua-platform", "sec-fetch-dest", "sec-fetch-mode", "sec-fetch-site", "origin", "referer", "pragma", "max-forwards", "x-http-method-override", "if-unmodified-since", "if-none-match", "if-match", "if-range", "accept-datetime"],
            defaultHeaders: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            insecureSkipVerify: false,
            isByteRequest: false,
            isByteResponse: false,
            isRotatingProxy: false,
            proxyUrl: null,
            defaultCookies: null,
            disableIPV6: false,
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
            ...options
        };

        this.sessionId = crypto.randomUUID();

        if (!TlsClient.libClient) {
            TlsClient.libClient = new Client(this.defaultOptions);
        }
    }

    async #init() {
        if (TlsClient.libClient.isLoaded != true) {
            await TlsClient.libClient.open();
        }
    }

    /**
     * @description Set the default cookies for the TlsClient
     * @param {import('./typedefs.js').Cookie[]} cookies 
     * @returns 
     */
    setDefaultCookies(cookies) {
        this.defaultOptions.defaultCookies = cookies;
    }

    /**
     * @description Set the default headers for the TlsClient
     * @param {import('./typedefs.js').Headers} headers
     * @returns
     */
    setDefaultHeaders(headers) {
        this.defaultOptions.defaultHeaders = headers;
    }

    #combineOptions(options) {
        const defaultHeaders = this.defaultOptions.defaultHeaders || {};
        const headers = {
            ...defaultHeaders,
            ...options.headers || {}
        }

        const defaultCookies = this.defaultOptions.defaultCookies || [];
        const requestCookies = [
            ...defaultCookies,
            ...options.requestCookies || []
        ]

        return {
            ...this.defaultOptions,
            ...options,
            headers,
            requestCookies,

            // Remove the headers and cookies from the default options
            defaultCookies: undefined,
            defaultHeaders: undefined
        }
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
        return TlsClient.libClient.close();
    }

    /**
     * @description Gets the session ID if session rotation is not enabled.
     * @returns {string|null} The session ID, or null if session rotation is enabled.
     */
    getSession() {
        return this.defaultOptions.rotateSessions ? null : this.sessionId;
    }

    /**
     * @description Destroys the sessionId 
     * @returns {}
     */
    destorySession() {
        return TlsClient.libClient.destroySession(this.sessionId);
    }

    #genSession() {
        return this.defaultOptions.rotateSessions ? crypto.randomUUID() : this.sessionId;
    }

    /**
     * @description Frees memory associated with a given ID.
     * @param {string} id - The ID associated with the memory to free.
     * @returns {Promise} A promise that resolves when the memory has been freed.
     */
    async #freeMemory(id) {
        return TlsClient.libClient.freeMemory(id);
    }

    async sendRequest(options) {
        const request = JSON.parse(TlsClient.libClient.request(JSON.stringify(options)));
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
        } while (options.retryIsEnabled && options.retryMaxCount > retryCount && options.retryStatusCodes.includes(response.status));

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
     * @param {import('./typedefs.js').TlsClientOptions} options 
     * @returns {Promise<import('./typedefs.js').TlsClientResponse>}
     */
    async get(url, options = {}) {
        return this.#request({
            "sessionId": this.#genSession(),
            "requestUrl": this.#convertUrl(url),
            "requestMethod": "GET",
            "requestBody": null,
            "requestCookies": [],
            ...options
        });
    }

    /**
     * @description Send a POST request
     * @param {URL|string} url 
     * @param {JSON|string} body 
     * @param {import('./typedefs.js').TlsClientOptions} options 
     * @returns {Promise<import('./typedefs.js').TlsClientResponse>}
     */
    async post(url, body, options = {}) {
        if (typeof body === 'object') body = JSON.stringify(body);
        if (typeof body !== 'string') body = body.toString();

        return this.#request({
            "sessionId": this.#genSession(),
            "requestUrl": this.#convertUrl(url),
            "requestMethod": "POST",
            "requestBody": this.#convertBody(body),
            "requestCookies": [],
            ...options
        });
    }

    /**
     * @description Send a PUT request
     * @param {URL|string} url 
     * @param {JSON|string} body 
     * @param {import('./typedefs.js').TlsClientOptions} options 
     * @returns {Promise<import('./typedefs.js').TlsClientResponse>}
     */
    async put(url, body, options = {}) {
        return this.#request({
            "sessionId": this.#genSession(),
            "requestUrl": this.#convertUrl(url),
            "requestMethod": "PUT",
            "requestBody": this.#convertBody(body),
            "requestCookies": [],
            ...options
        });
    }

    /**
     * @description Send a DELETE request
     * @param {URL|string} url 
     * @param {import('./typedefs.js').TlsClientOptions} options 
     * @returns {Promise<import('./typedefs.js').TlsClientResponse>}
     */
    async delete(url, options = {}) {
        return this.#request({
            "sessionId": this.#genSession(),
            "requestUrl": this.#convertUrl(url),
            "requestMethod": "DELETE",
            "requestBody": "",
            "requestCookies": [],
            ...options
        });
    }

    /**
     * @description Send a HEAD request
     * @param {URL|string} url 
     * @param {import('./typedefs.js').TlsClientOptions} options 
     * @returns {Promise<import('./typedefs.js').TlsClientResponse>}
     */
    async head(url, options = {}) {
        return this.#request({
            "sessionId": this.#genSession(),
            "requestUrl": this.#convertUrl(url),
            "requestMethod": "HEAD",
            "requestBody": "",
            "requestCookies": [],
            ...options
        });
    }

    /**
     * @description Send a PATCH request
     * @param {URL|string} url 
     * @param {JSON|string} body 
     * @param {import('./typedefs.js').TlsClientOptions} options 
     * @returns {Promise<import('./typedefs.js').TlsClientResponse>}
     */
    async patch(url, body, options = {}) {
        return this.#request({
            "sessionId": this.#genSession(),
            "requestUrl": this.#convertUrl(url),
            "requestMethod": "PATCH",
            "requestBody": this.#convertBody(body),
            "requestCookies": [],
            ...options
        });
    }

    /**
     * @description Send a OPTIONS request
     * @param {URL|string} url 
     * @param {import('./typedefs.js').TlsClientOptions} options 
     * @returns {Promise<import('./typedefs.js').TlsClientResponse>}
     */
    async options(url, options = {}) {
        return this.#request({
            "sessionId": this.#genSession(),
            "requestUrl": this.#convertUrl(url),
            "requestMethod": "OPTIONS",
            "requestBody": "",
            "requestCookies": [],
            ...options
        });
    }

    /**
     * @description Get the cookies for a given session and URL
     * @param {string} sessionId - The existing session ID.
     * @param {string} url - The URL to get cookies for.
     * @returns {Promise<import('./typedefs.js').CookieResponse>}
     */
    async getCookiesFromSession(sessionId, url) {
        if (!sessionId || !url) throw new Error('Missing sessionId or url parameter');
        const response = JSON.parse(TlsClient.libClient.getCookiesFromSession(JSON.stringify({ sessionId, url })));
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
     * @returns {Promise<import('./typedefs.js').CookieResponse>}
     */
    async addCookiesToSession(sessionId, url, cookies) {
        if (!sessionId || !url || !cookies) throw new Error('Missing sessionId, url or cookies parameter');
        const response = JSON.parse(TlsClient.libClient.addCookiesToSession(JSON.stringify({ sessionId, url, cookies })));
        await this.#freeMemory(response.id);
        delete response.id;

        return response;
    }

    /**
     * @description Rotate the session ID.
     * @returns {string} The new session ID.
     */
    rotateSession() {
        this.sessionId = crypto.randomUUID();
        return this.sessionId;
    }

}
export default TlsClient;