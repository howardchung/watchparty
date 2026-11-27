import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/bundler-plugins/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.BACKEND_PROXY_TARGET || 'http://127.0.0.1:8081';
  // Preserve the FontIran project-license comment above bundled font declarations.
  return { esbuild: { legalComments: 'inline' }, define: { 'import.meta.env.VITE_APP_BUILD': JSON.stringify(env.VITE_APP_BUILD || new Date().toISOString()) }, plugins: [react(), ...(env.SENTRY_AUTH_TOKEN ? [sentryVitePlugin({
    org: env.SENTRY_ORG, project: 'watchparty-web', authToken: env.SENTRY_AUTH_TOKEN,
    telemetry: false, sourcemaps: { filesToDeleteAfterUpload: ['./dist/**/*.map'] },
    release: { name: env.VITE_APP_BUILD, inject: false },
  })] : [])], build: { minify: 'esbuild', cssMinify: 'esbuild', sourcemap: env.SENTRY_AUTH_TOKEN ? 'hidden' : false }, server: { hmr: env.MESH_TEST_MODE === '1' ? false : undefined, proxy: { '/v1': { target }, '/socket.io': { target, ws: true } } } };
});
