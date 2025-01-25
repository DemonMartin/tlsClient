import fs from 'node:fs';
import fetch from 'node-fetch';

class DownloadManager {
    static #downloading = false;
    static #downloadPromise = null;

    /**
     * Downloads a file with mutex-like locking to prevent multiple simultaneous downloads
     * @param {string} url - URL to download from
     * @param {string} destination - Where to save the file
     * @returns {Promise<void>}
     */
    static async download(url, destination) {
        // If already downloading, return the existing promise
        if (this.#downloading) {
            return this.#downloadPromise;
        }

        // If file exists, no need to download
        if (fs.existsSync(destination)) {
            return Promise.resolve();
        }

        // Set downloading flag and create new promise
        this.#downloading = true;
        this.#downloadPromise = (async () => {
            try {
                console.log('[tlsClient] Detected missing TLS library');
                console.log('[tlsClient] DownloadPath: ' + url);
                console.log('[tlsClient] DestinationPath: ' + destination);
                console.log('[tlsClient] Downloading TLS library... This may take a while');

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Unexpected response ${response.statusText}`);
                }

                const fileStream = fs.createWriteStream(destination);
                await new Promise((resolve, reject) => {
                    response.body.pipe(fileStream);
                    fileStream.on('finish', () => {
                        console.log('[tlsClient] Successfully downloaded TLS library');
                        resolve();
                    });
                    fileStream.on('error', reject);
                });
            } finally {
                // Reset flags when done or on error
                this.#downloading = false;
                this.#downloadPromise = null;
            }
        })();

        return this.#downloadPromise;
    }
}

export default DownloadManager;
