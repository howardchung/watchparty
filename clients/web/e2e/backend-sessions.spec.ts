import { test, expect, type BrowserContext, type Page } from '@playwright/test';

const sessionPath = '/v1/guest-sessions';
const home = (page: Page) => page.getByRole('button', { name: 'Start a party', exact: true });

async function openHome(page: Page) {
  await page.goto('/');
  await expect(home(page)).toBeVisible();
}

// Import the same live adapter as the UI, returning only a non-secret identity UUID.
async function identity(page: Page): Promise<string> {
  return page.evaluate(async () => {
    const { ensureSession } = await import('/src/data/auth.ts');
    return (await ensureSession({ name: 'Nika', avatar: 'COMET', language: 'en' })).identity.id;
  });
}

async function blockGoogleAuth(context: BrowserContext) {
  const attempted: string[] = [];
  await context.route(/https?:\/\/[^/]*(?:googleapis\.com|firebaseio\.com|firebaseapp\.com|firebase\.com)(?:\/|$)/, route => {
    attempted.push(new URL(route.request().url()).hostname);
    return route.abort('blockedbyclient');
  });
  return attempted;
}

test('backend guest cookies restore the same identity without Google auth or web-storage credentials', async ({ context, page }) => {
  const googleAuth = await blockGoogleAuth(context);
  await context.addInitScript(() => {
    if (!localStorage.getItem('roomio-auth-format')) {
      localStorage.setItem('roomio-theme', 'dark');
      localStorage.setItem('roomio-auth-established', '1');
      localStorage.setItem('roomio-last-owned-code', 'OLDPARTY');
      sessionStorage.setItem('roomio-active-code', 'OLDPARTY');
    }
  });
  let creates = 0;
  const secretStorage: boolean[] = [];
  page.on('response', async response => {
    if (!response.ok() || ![sessionPath, `${sessionPath}/refresh`].includes(new URL(response.url()).pathname)) return;
    const value = await response.json();
    if (new URL(response.url()).pathname === sessionPath) creates++;
    // Check in the browser without returning token values to test output or artifacts.
    secretStorage.push(await page.evaluate(({ accessToken, refreshToken }) => {
      const values = [...Object.values(localStorage), ...Object.values(sessionStorage)];
      return values.some(value => value.includes(accessToken) || (refreshToken && value.includes(refreshToken)));
    }, { accessToken: value.accessToken, refreshToken: value.refreshToken }));
  });
  await openHome(page);
  const original = await identity(page);
  const cookie = (await context.cookies()).find(value => value.name === 'roomio-refresh');
  expect(Boolean(cookie?.httpOnly && cookie.sameSite === 'Strict' && cookie.path === '/')).toBe(true);
  expect(await page.evaluate(() => document.cookie.includes('roomio-refresh'))).toBe(false);
  expect(await page.evaluate(() => localStorage.getItem('roomio-theme'))).toBe('dark');
  expect(await page.evaluate(() => localStorage.getItem('roomio-auth-established'))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem('roomio-last-owned-code'))).toBeNull();
  expect(await page.evaluate(() => sessionStorage.getItem('roomio-active-code'))).toBeNull();
  await page.reload();
  await expect(home(page)).toBeVisible();
  expect(await identity(page)).toBe(original);
  expect(creates).toBe(1);
  expect(secretStorage.length).toBeGreaterThanOrEqual(2);
  expect(secretStorage.every(value => !value)).toBe(true);
  expect(googleAuth).toEqual([]);
});

test('simultaneous tabs create one guest and concurrent refresh keeps its identity', async ({ context }) => {
  const googleAuth = await blockGoogleAuth(context);
  let creates = 0;
  context.on('response', response => {
    if (new URL(response.url()).pathname === sessionPath && response.status() === 201) creates++;
  });
  const first = await context.newPage();
  const second = await context.newPage();
  await Promise.all([openHome(first), openHome(second)]);
  const original = await identity(first);
  expect(await identity(second)).toBe(original);
  await Promise.all([first, second].map(page => page.evaluate(async () => {
    const { token } = await import('/src/data/auth.ts');
    await Promise.all([token(true), token(true), token(true)]);
  })));
  expect(await identity(first)).toBe(original);
  expect(await identity(second)).toBe(original);
  expect(creates).toBe(1);
  expect(googleAuth).toEqual([]);
});

test('expired access retries through refresh and restoration outages never issue another identity', async ({ page }) => {
  let creates = 0;
  page.on('response', response => {
    if (new URL(response.url()).pathname === sessionPath && response.status() === 201) creates++;
  });
  await openHome(page);
  const original = await identity(page);
  let expired = false;
  await page.route('**/v1/capabilities', async route => {
    if (!expired) {
      expired = true;
      return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ code: 'SESSION_EXPIRED' }) });
    }
    return route.continue();
  });
  const refresh = page.waitForResponse(response => new URL(response.url()).pathname === `${sessionPath}/refresh` && response.status() === 200);
  expect(await page.evaluate(async () => {
    const { request } = await import('/src/data/api.ts');
    return (await request<{ protocolVersion: number }>('/v1/capabilities')).protocolVersion;
  })).toBe(3);
  await refresh;
  expect(await identity(page)).toBe(original);
  await page.route('**/v1/guest-sessions/refresh', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ code: 'AUTH_UNAVAILABLE' }) }));
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('Your saved identity is kept');
  await expect(page.getByRole('button', { name: 'Reset guest identity', exact: true })).toHaveCount(0);
  expect(creates).toBe(1);
  await page.unroute('**/v1/guest-sessions/refresh');
  await page.getByRole('button', { name: 'Retry connection', exact: true }).click();
  await expect(home(page)).toBeVisible();
  expect(await identity(page)).toBe(original);
  expect(creates).toBe(1);
});

test('revoked guest requires confirmed reset before a new identity is created', async ({ page }) => {
  let creates = 0;
  page.on('response', response => {
    if (new URL(response.url()).pathname === sessionPath && response.status() === 201) creates++;
  });
  await openHome(page);
  const original = await identity(page);
  expect(await page.evaluate(async () => {
    const { request } = await import('/src/data/api.ts');
    await request('/v1/guest-sessions/revoke', {});
    return true;
  })).toBe(true);
  await page.reload();
  const reset = page.getByRole('button', { name: 'Reset guest identity', exact: true });
  await expect(reset).toBeVisible();
  expect(creates).toBe(1);
  page.once('dialog', dialog => dialog.dismiss());
  await reset.click();
  await expect(reset).toBeVisible();
  expect(creates).toBe(1);
  page.once('dialog', dialog => dialog.accept());
  await reset.click();
  await expect(home(page)).toBeVisible();
  expect(await identity(page)).not.toBe(original);
  expect(creates).toBe(2);
});
