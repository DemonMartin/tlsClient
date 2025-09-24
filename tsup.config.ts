import { defineConfig } from 'tsup';

export default defineConfig([
    {
        entryPoints: ['src/index.ts', 'src/utils/worker.ts'],
        format: ['cjs', 'esm'],
        dts: {
            resolve: true,
        },
        minify: false,
        outDir: 'dist/',
        clean: true,
        sourcemap: false,
        bundle: true,
        splitting: false,
        outExtension(ctx) {
            return {
                dts: '.d.ts',
                js: ctx.format === 'cjs' ? '.cjs' : '.mjs',
            };
        },
        treeshake: false,
        target: 'es2022',
        platform: 'node',
        tsconfig: './tsconfig.json',
        cjsInterop: true,
        keepNames: true,
        skipNodeModulesBundle: true,
        // Mark native modules and Node.js built-ins as external
        external: [
            'koffi',
            'piscina',
            'worker_threads',
            'node:*',
            // Explicitly exclude all native modules
            /\.node$/,
        ],
    },
]);
