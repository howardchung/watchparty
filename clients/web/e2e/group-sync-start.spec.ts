import { expect, test } from '@playwright/test';

for (const compact of [false, true]) test(`sync Start counts only accepted viewers: ${compact ? 'compact dark RTL' : 'desktop light'}`, async ({ page }) => {
  page.on('pageerror', error => { throw error; });
  await page.setViewportSize({ width: compact ? 390 : 1280, height: 900 });
  await page.goto(`/e2e/group-sync.html?compact=${compact ? '1' : ''}`);
  const render = (responses: string[], connected = true, busy = false) => page.evaluate(({ responses, connected, busy }) => {
    (window as unknown as {renderSync(r: string[], c: boolean, b: boolean): void}).renderSync(responses, connected, busy);
  }, { responses, connected, busy });
  await expect(page.getByRole('button', { name: 'Start with 0', exact: true })).toBeDisabled();
  await render(['DECLINED', 'WITHDRAWN']);
  await expect(page.getByRole('button', { name: 'Start with 0', exact: true })).toBeDisabled();
  await render(['ACCEPTED', 'PENDING']);
  await expect(page.getByRole('button', { name: 'Start with 1', exact: true })).toBeEnabled();
  await render(['ACCEPTED', 'ACCEPTED']);
  await expect(page.getByRole('button', { name: 'Start with 2', exact: true })).toBeEnabled();
  await render(['WITHDRAWN', 'WITHDRAWN']);
  await expect(page.getByRole('button', { name: 'Start with 0', exact: true })).toBeDisabled();
  await render(['ACCEPTED'], false);
  await expect(page.getByRole('button', { name: 'Start with 1', exact: true })).toBeDisabled();
  await render(['ACCEPTED'], true, true);
  await expect(page.getByRole('button', { name: 'Start with 1', exact: true })).toBeDisabled();
  await render(['ACCEPTED']);
  await page.getByRole('button', { name: 'Start with 1', exact: true }).click();
  expect(await page.evaluate(() => (window as unknown as {committed: boolean}).committed)).toBe(true);
});
