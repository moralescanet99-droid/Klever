import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Modo «demo»: un único HTML autocontenido (todo en el navegador, datos de ejemplo) para publicarlo como artefacto o abrirlo sin servidor.
export default defineConfig(({ mode }) => ({
  plugins: [svelte(), ...(mode === 'demo' ? [viteSingleFile()] : [])],
  build: { outDir: mode === 'demo' ? 'dist-demo' : 'dist', target: 'es2022', assetsInlineLimit: mode === 'demo' ? 100_000_000 : 4096 },
  server: { port: 5173, proxy: { '/api': 'http://127.0.0.1:8788' } },
  test: { include: ['src/**/*.test.ts', 'functions/**/*.test.ts'], environment: 'node' },
}));
