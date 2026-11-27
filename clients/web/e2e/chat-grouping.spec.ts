import { expect, test } from '@playwright/test';

test('groups consecutive identities and preserves failed-send recovery across layouts', async ({ page }) => {
  await page.route('**/src/main.tsx', route => route.fulfill({
    contentType: 'application/javascript', body: "import '/src/styles.css';",
  }));
  await page.goto('/?lang=en');
  await page.evaluate(async () => {
    const { default: React } = await import('/node_modules/.vite/deps/react.js');
    const { default: { createRoot } } = await import('/node_modules/.vite/deps/react-dom_client.js');
    const { PartyChat } = await import('/src/components/PartyChat.tsx');
    const host = document.createElement('div');
    document.body.replaceChildren(host);
    const root = createRoot(host);
    let sequence = 0;
    const message = (identityId: string, text: string) => ({
      id: String(++sequence), roomId: 'room', identityId, membershipId: identityId,
      displayName: 'Same name', avatar: 'berry', text, createdAt: '2026-11-12T06:00:00Z', sequence,
    });
    const chat = {
      identityId: 'me',
      history: { messages: [
        message('friend-a', 'First friend bubble'), message('friend-a', 'Second friend bubble'),
        message('friend-b', 'Different identity, same name'),
        message('me', 'My first bubble'), message('me', 'My second bubble'),
      ], hasMore: false },
      send: async () => { throw new Error('Unavailable'); },
      loadEarlier: async () => {}, refresh: async () => {},
    };
    root.render(React.createElement(PartyChat, { chat, connected: true }));
  });
  const rows = page.locator('.chat-message');
  await expect(rows).toHaveCount(5);
  await expect(page.locator('.chat-message__meta')).toHaveCount(3);
  await expect(page.locator('.chat-message__meta time')).toHaveCount(3);
  await expect(rows.nth(1).locator('.chat-message__meta')).toHaveCount(0);
  await expect(rows.nth(2).locator('.chat-message__meta')).toHaveText(/Same name/);
  await expect(rows.nth(3).locator('.chat-delivery')).toHaveCount(0);
  await expect(rows.nth(4).locator('.chat-delivery')).toHaveText('Sent');
  await page.getByRole('textbox', { name: 'Message the party', exact: true }).fill('Failed continuation');
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await expect(page.getByText('Not sent', { exact: true })).toBeVisible();
  await expect(page.locator('.chat-message__meta')).toHaveCount(3);
  await expect(page.getByText('Sent', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Retry', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Discard', exact: true }).click();
  await expect(rows).toHaveCount(5);
  await expect(page.getByText('Sent', { exact: true })).toHaveCount(1);
  for (const setup of [
    { width: 1280, height: 900, fa: false, dark: false, large: false },
    { width: 360, height: 800, fa: true, dark: true, large: true },
  ]) {
    await page.setViewportSize(setup);
    await page.evaluate(async value => {
      const { setLanguage } = await import('/src/i18n.ts');
      setLanguage(value.fa ? 'فارسی' : 'English');
      document.documentElement.lang = value.fa ? 'fa' : 'en';
      document.documentElement.dir = value.fa ? 'rtl' : 'ltr';
      document.documentElement.dataset.theme = value.dark ? 'dark' : 'light';
      document.documentElement.dataset.textScale = value.large ? 'large' : 'standard';
    }, setup);
    await expect(page.locator('html')).toHaveAttribute('dir', setup.fa ? 'rtl' : 'ltr');
    await expect(page.locator('.chat-message__meta')).toHaveCount(3);
    const bubbles = page.locator('.chat-message__bubble');
    const first = await bubbles.nth(0).boundingBox();
    const second = await bubbles.nth(1).boundingBox();
    expect(Math.abs((setup.fa ? first!.x + first!.width : first!.x) - (setup.fa ? second!.x + second!.width : second!.x))).toBeLessThan(1);
    await page.locator('.chat-feed').evaluate(el => { el.scrollTop = el.scrollHeight; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `/tmp/watchparty-chat-grouping-${setup.width}.png`, fullPage: true });
  }
});
