import { expect, test, type Page } from '@playwright/test';

async function chooseLanguage(page: Page, language: 'English' | 'فارسی', persian = false) {
  await page.getByRole('button', { name: persian ? 'زبان برنامه' : 'App language', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('radio')).toHaveCount(2);
  await page.getByRole('dialog').getByRole('radio', { name: language, exact: true }).check();
  await page.getByRole('button', { name: `${persian ? 'انتخاب' : 'Use'} ${language}`, exact: true }).click();
}

test('Persian profile choice sends fa, persists after reload, and switches back to English', async ({ page }) => {
  let language = 'en';
  const name = () => 'Ice Queen';
  await page.route('**/v1/guest-sessions/**', async route => {
    if (route.request().method() === 'PATCH') {
      const body = route.request().postDataJSON();
      language = body.language;
      expect(body.name).toBe(name());
      await route.fulfill({ json: { identity: { id: 'guest', name: name(), avatar: 'comet', language } } });
    } else await route.fulfill({ json: { identity: { id: 'guest', name: name(), avatar: 'comet', language }, accessToken: 'test', accessExpiresAt: new Date(Date.now() + 3600000).toISOString(), refreshExpiresAt: new Date(Date.now() + 86400000).toISOString() } });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await chooseLanguage(page, 'فارسی');
  await expect(page.locator('.profile-spotlight strong')).toHaveText('Ice Queen');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'با هم ببینید' })).toBeVisible();
  expect(language).toBe('fa');
  await expect(page.getByText(name(), { exact: true })).toBeVisible();
  await expect(page).toHaveTitle('watchparty');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fa');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await page.reload();
  await expect(page.getByRole('button', { name: 'ساخت دورهمی', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'تنظیمات', exact: true }).click();
  await expect(page.locator('.language-picker__trigger strong')).toHaveText('فارسی');
  await chooseLanguage(page, 'English', true);
  await page.getByRole('button', { name: 'ذخیره تغییرات', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Stream and chill' })).toBeVisible();
  expect(language).toBe('en');
  await expect(page).toHaveTitle('watchparty');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
});

for (const config of [{ width: 360, height: 800, theme: 'dark', large: true }, { width: 1440, height: 1000, theme: 'light', large: false }]) {
  test(`Persian screens fit at ${config.width}px in ${config.theme}`, async ({ page }) => {
    await page.setViewportSize(config);
    for (const preview of ['home', 'settings-populated', 'party-manager', 'room-preview-owner-absent', 'owner-empty']) {
      await page.goto(`/?preview=${preview}&lang=fa&theme=${config.theme}&largeText=${config.large ? 1 : 0}`);
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
      // Use the preview list below only; a typo must fail instead of reaching the live backend.
      await expect(page.locator('.screen')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (preview === 'settings-populated') {
        await page.getByRole('button', { name: 'زبان برنامه', exact: true }).click();
        await expect(page.getByRole('dialog').getByRole('radio')).toHaveCount(2);
        await expect(page.getByRole('radio', { name: 'فارسی', exact: true })).toBeAttached();
        await page.keyboard.press('Escape');
      }
      await page.screenshot({ path: `/tmp/watchparty-persian-${config.width}-${preview}.png`, fullPage: true });
    }
  });
}

test('discard and failed saves keep the applied language and retain the draft for retry', async ({ page }) => {
  await page.route('**/v1/guest-sessions/**', route => route.fulfill(route.request().method() === 'PATCH'
    ? { status: 503, json: { code: 'UNAVAILABLE' } }
    : { json: { identity: { id: 'guest', name: 'Ice Queen', avatar: 'comet', language: 'en' }, accessToken: 'test', accessExpiresAt: new Date(Date.now() + 3600000).toISOString(), refreshExpiresAt: new Date(Date.now() + 86400000).toISOString() } }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await chooseLanguage(page, 'فارسی');
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.locator('.language-picker__trigger strong')).toHaveText('English');
  await chooseLanguage(page, 'فارسی');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.locator('.md-snackbar')).toContainText('The service is unavailable. Try again.');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.language-picker__trigger strong')).toHaveText('فارسی');
});

for (const lang of ['en', 'fa']) {
  test(`focused picker stages, cancels and searches only supported languages in ${lang}`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(`/?preview=settings-populated&lang=${lang}&theme=dark`);
    await page.locator('html').evaluate(el => { el.style.fontSize = '150%'; });
    const trigger = page.locator('.language-picker__trigger');
    const original = lang === 'fa' ? 'فارسی' : 'English';
    const target = lang === 'fa' ? 'English' : 'فارسی';
    await trigger.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('radio')).toHaveCount(2);
    await dialog.getByRole('radio', { name: target, exact: true }).check();
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    await expect(trigger.locator('strong')).toHaveText(original);
    await trigger.click();
    await expect(dialog.getByRole('radio', { name: original, exact: true })).toBeChecked();
    await dialog.getByRole('searchbox').fill('not-a-language');
    await expect(dialog.getByRole('status')).toContainText(lang === 'fa' ? 'زبانی پیدا نشد' : 'No languages found');
    await dialog.getByRole('button', { name: lang === 'fa' ? 'نمایش همه زبان‌ها' : 'Show all languages' }).click();
    await dialog.getByRole('searchbox').fill('فارسی');
    await expect(dialog.getByRole('radio')).toHaveCount(1);
    await dialog.getByRole('searchbox').fill('');
    await dialog.getByRole('radio', { name: target, exact: true }).focus();
    await page.keyboard.press('Space');
    await page.screenshot({ path: `/tmp/watchparty-settings-integrated-${lang}-language.png` });
    const bounds = await dialog.boundingBox();
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(801);
    await dialog.getByRole('button', { name: `${lang === 'fa' ? 'انتخاب' : 'Use'} ${target}`, exact: true }).click();
    await expect(trigger.locator('strong')).toHaveText(target);
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
  });
}
