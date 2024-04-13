import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";
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
        let osType = os.type().toLowerCase();

        if (osType.includes("linux")) {
            let distro;
            try {
                distro = execSync('lsb_release -a').toString();
            } catch (error) {
                console.log("Unable to determine Linux distribution. Defaulting to specific distribution.");
                this.distribution = this.arch == "arm64" ? this.arch : "armv7";
                return;
            }

            if (distro.toLowerCase().includes("ubuntu")) {
                this.distribution = "ubuntu-amd64";
            } else if (distro.toLowerCase().includes("alpine")) {
                this.distribution = `alpine-amd64`;
            } else {
                this.distribution = this.arch == "arm64" ? this.arch : "armv7";
            }
        } else {
            console.log("Unsupported OS type. Defaulting to specific distribution.");
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
    getTLSDependencyPath(customPath = null) {
        let _filename = `${this.filename}-${this.distribution}-v${this.version}.${this.extension}`;
        const url = new URL(`https://github.com/bogdanfinn/tls-client/releases/download/v${this.version}/${_filename}`);
        const downloadFolder = customPath ?? (os.tmpdir() ?? process.cwd());
        if (!fs.existsSync(downloadFolder))
            throw new Error(`The download folder does not exist: ${downloadFolder}`);

        const destination = path.join(downloadFolder, _filename);

        return {
            DOWNLOAD_PATH: url.href,
            TLS_LIB_PATH: destination,
        };
    }
}

export default TlsDependency;