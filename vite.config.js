import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
    sourcemap: true,
    minify: 'esbuild',
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      // SillyTavern loads the bundle as a plain ES module via the manifest's
      // "js" field. Bundle every dependency (pretext + helpers) into a single
      // file so the file dropped into third-party/<ext>/dist/ is self-contained.
      external: [],
    },
  },
});
