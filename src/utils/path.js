import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { URL } from 'node:url';

class TlsDependency {
    constructor() {
        this.arch = os.arch();
        this.platform = os.platform();
        this.version = '1.9.1';
        this.filename = 'tls-client-xgo';
        this.extension = '';
        this.distribution = '';
        this.setDetails();
    }

    setDetails() {
        if (this.platform === 'win32') {
            this.extension = 'dll';
            this.distribution = this.arch.includes('64') ? 'windows-amd64' : 'windows-386';
        } else if (this.platform === 'darwin') {
            this.extension = 'dylib';
            this.distribution = this.arch == 'arm64' ? 'darwin-arm64' : 'darwin-amd64';
        } else if (this.platform === 'linux') {
            this.extension = 'so';

            const archMap = {
                arm64: 'linux-arm64',
                x64: 'linux-amd64',
                ia32: 'linux-386',
                arm: 'linux-arm-7', // assuming ARMv7
                ppc64: 'linux-ppc64le',
                riscv64: 'linux-riscv64',
                s390x: 'linux-s390x',
            };

            const distribution = archMap[this.arch];

            if (!distribution) {
                console.error(`Unsupported architecture: ${this.arch}, defaulting to linux-amd64`);
            }

            this.distribution = distribution || 'linux-amd64';
        } else {
            console.error(`Unsupported platform: ${this.platform}`);
            process.exit(1);
        }
    }

    getTLSDependencyPath(customPath = null) {
        let _filename = `${this.filename}-${this.version}-${this.distribution}.${this.extension}`;
        const url = new URL(`https://github.com/bogdanfinn/tls-client/releases/download/v${this.version}/${_filename}`);
        const downloadFolder = customPath ?? os.tmpdir() ?? process.cwd();
        if (!fs.existsSync(downloadFolder)) throw new Error(`The download folder does not exist: ${downloadFolder}`);

        const destination = path.join(downloadFolder, _filename);

        return {
            DOWNLOAD_PATH: url.href,
            TLS_LIB_PATH: destination,
        };
    }
}

export default TlsDependency;
