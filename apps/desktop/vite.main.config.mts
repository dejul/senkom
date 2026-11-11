import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'node24',
    outDir: 'dist/main',
    lib: {
      entry: { main: 'electron/main.ts', preload: 'electron/preload.ts' },
      formats: ['cjs'],
      fileName: (_format, entry) => `${entry}.js`,
    },
    rolldownOptions: { external: [/^node:/, 'electron'] },
  },
});
