import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { URL } from "node:url";

class TlsDependency {
    constructor() {
        this.arch = os.arch();
        this.platform = os.platform();
        this.version = "1.7.2";
        this.filename = "";
        this.extension = "";
        this.distribution = "";
        this.setDetails();
    }

    setDetails() {
        if (this.platform === "win32") {
            this.filename = "tls-client-windows";
            this.extension = "dll";
            this.distribution = this.arch.includes("64") ? "64" : "32";
        } else if (this.platform === "darwin") {
            this.filename = "tls-client-darwin";
            this.extension = "dylib";
            this.distribution = this.arch == "arm64" ? this.arch : "amd64";
        } else if (this.platform === "linux") {
            this.filename = "tls-client-linux";
            this.extension = "so";
            this.setLinuxDistribution();
        } else {
            console.error(`Unsupported platform: ${this.platform}`);
            process.exit(1);
        }
    }

    setLinuxDistribution() {
        let releaseDetails = fs.readFileSync("/etc/os-release", "utf8");
        const lines = releaseDetails.split("\n");
        const release = {};
        lines.forEach((line, _) => {
            const words = line.split("=");
            release[words[0].trim().toLowerCase()] = words[1].trim();
        });

        if (release.id_like.toLowerCase().includes("ubuntu") || release.id.toLowerCase().includes("ubuntu")) {
            this.distribution = "ubuntu-amd64";
        } else if (release.id.toLowerCase().includes("alpine")) {
            this.distribution = `alpine-amd64`;
        } else {
            this.distribution = this.arch == "arm64" ? this.arch : "armv7";
        }
    }

    /**
     * @typedef {Object} TlsDependencyPath
     * @property {string} DOWNLOAD_PATH - The download path of the TLS library
     * @property {string} TLS_LIB_PATH - The destination path of the TLS library
     */

    /**
     * @description Get the TLS dependency path and download url based on the platform 
     * @returns {TlsDependencyPath} An object with the download path and the destination path
     */
    getTLSDependencyPath() {
        let _filename = `${this.filename}-${this.distribution}-v${this.version}.${this.extension}`;
        const url = new URL(`https://github.com/bogdanfinn/tls-client/releases/download/v${this.version}/${_filename}`);
        const destination = path.join(os.tmpdir(), _filename);

        return {
            DOWNLOAD_PATH: url.href,
            TLS_LIB_PATH: destination,
        };
    }
}

export default TlsDependency;