import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e', fullyParallel: false, workers: 1, timeout: 60000,
  use: { baseURL: process.env.MESH_BASE_URL || 'http://127.0.0.1:5173', headless: true, launchOptions: { ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}), args: [...(process.env.MESH_TLS_INSECURE === '1' ? ['--ignore-certificate-errors'] : []), '--no-sandbox', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] }, trace: 'off' },
  webServer: { command: 'npm run dev -- --host 127.0.0.1', url: process.env.MESH_BASE_URL || 'http://127.0.0.1:5173', reuseExistingServer: true },
});
