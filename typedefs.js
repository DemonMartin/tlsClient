/**
 * @typedef {"chrome_103"|"chrome_104"|"chrome_105"|"chrome_106"|"chrome_107"|"chrome_108"|"chrome_109"|"chrome_110"|"chrome_111"|"chrome_112"|"chrome_116_PSK"|"chrome_116_PSK_PQ"|"chrome_117"|"chrome_120"} ChromeProfile
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
 * @typedef {"firefox_102"|"firefox_104"|"firefox_105"|"firefox_106"|"firefox_108"|"firefox_110"|"firefox_117"|"firefox_120"} FirefoxProfile
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
 * @property {ClientProfile} [tlsClientIdentifier='chrome_120'] - Identifier of the TLS client
 * @property {boolean} [rotateSessions=false] - If true, sessions will be rotated on each request -> This will cause the cookies to be reset
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
 */

/**
 * @typedef {Object} TlsClientResponse
 * @property {string} sessionId - The reusable sessionId if provided on the request
 * @property {number} status - The status code of the response
 * @property {string} target - The target URL of the request
 * @property {string} body - The response body as a string, or the error message
 * @property {Object} headers - The headers of the response
 * @property {Object} cookies - The cookies of the response
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

export { };