import { expect, test } from '@playwright/test';

for (const lang of ['en', 'fa']) {
  test(`chat Ctrl + Enter and removed qualifiers in ${lang}`, async ({ page }) => {
    await page.goto(`/?preview=home&lang=${lang}`);
    await page.evaluate(async () => {
      const { default: { createElement } } = await import('/node_modules/.vite/deps/react.js');
      const { default: { createRoot } } = await import('/node_modules/.vite/deps/react-dom_client.js');
      const { PartyChat } = await import('/src/components/PartyChat.tsx');
      const host = document.createElement('div');
      document.body.replaceChildren(host);
      createRoot(host).render(createElement(PartyChat, { connected: true, chat: {
        identityId: 'self', history: { messages: [], hasMore: false },
        send: async (id: string, text: string) => ({ id, text, identityId: 'self', membershipId: 'member', roomId: 'room', displayName: 'Batman', avatar: 'mint', sequence: 1, createdAt: new Date().toISOString() }),
        loadEarlier: async () => {}, refresh: async () => {},
      } }));
    });
    await expect(page.locator('.chat-panel__title')).toHaveText(lang === 'fa' ? 'گپ دورهمی' : 'Party chat');
    await expect(page.locator('.chat-composer__hint')).toHaveText(lang === 'fa' ? 'ارسال با Ctrl + Enter' : 'Ctrl + Enter to send');
    const draft = page.locator('textarea');
    await draft.fill('سلام');
    await draft.press('Enter');
    await draft.press('Shift+Enter');
    await draft.press('a');
    await expect(draft).toHaveValue('سلام\n\na');
    await expect(page.locator('.chat-message__bubble')).toHaveCount(0);
    await draft.press('Control+Enter');
    await expect(page.locator('.chat-message__bubble')).toHaveText('سلام\n\na');
    await expect(draft).toHaveValue('');
  });
}

test('Persian creation and playback sentences', async ({ page }) => {
  await page.goto('/?preview=party-manager&lang=fa');
  await expect(page.getByText('یه دورهمی جدید بساز', { exact: true })).toBeVisible();
  await expect(page.getByText('میزبان تویی', { exact: true })).toBeVisible();
  await expect(page.getByText('یه دورهمی با سینمای خالی، بعدش میتونی دوستاتو اضافه کنی.', { exact: true })).toBeVisible();
  await page.goto('/?preview=player-paused&lang=fa');
  await expect(page.locator('.sync-band strong')).toHaveText('فیلمت وایستاده');
  await expect(page.locator('.sync-band .eyebrow')).toHaveCount(0);
});
