import { expect, test, type Page } from '@playwright/test';

async function mountChat(page: Page) {
  await page.route('**/src/main.tsx', route => route.fulfill({ contentType: 'application/javascript', body: "import '/src/styles.css';" }));
  await page.goto('/?lang=en');
  await page.evaluate(async () => {
    const { default: React } = await import('/node_modules/.vite/deps/react.js');
    const { default: { createRoot } } = await import('/node_modules/.vite/deps/react-dom_client.js');
    const { PartyChat } = await import('/src/components/PartyChat.tsx');
    const { ApiError } = await import('/src/data/errors.ts');
    const host = document.createElement('div'); document.body.replaceChildren(host);
    const root = createRoot(host);
    let connected = false;
    let failures = 0;
    const sends: {id: string; text: string}[] = [];
    const chat = {
      identityId: 'me', history: { messages: [], hasMore: false },
      send: async (id: string, text: string) => {
        sends.push({id, text});
        if (failures-- > 0) throw new ApiError('NETWORK');
        return { id, text, roomId: 'room', identityId: 'me', membershipId: 'member', displayName: 'Me', avatar: 'berry', createdAt: '2026-11-13T09:00:00Z', sequence: sends.length };
      }, loadEarlier: async () => {}, refresh: async () => {},
    };
    const render = () => root.render(React.createElement(PartyChat, { chat, connected }));
    Object.assign(window, { chatTest: { sends, connect: (value: boolean) => { connected = value; render(); }, fail: () => { failures = 1; } } });
    render();
  });
}

test('offline send waits, recovers automatically with stable ID and keeps newer draft', async ({ page }) => {
  await mountChat(page);
  const draft = page.getByRole('textbox', { name: 'Message the party', exact: true });
  await draft.fill('Queued message');
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await expect(page.getByText('Sending…', { exact: true })).toBeVisible();
  await expect(page.getByText('Chat is offline. Your draft stays here.', { exact: true })).toHaveCount(0);
  await draft.fill('New draft');
  expect(await page.evaluate(() => (window as any).chatTest.sends.length)).toBe(0);
  await page.evaluate(() => { (window as any).chatTest.fail(); (window as any).chatTest.connect(true); });
  await expect(page.getByText('Sent', { exact: true })).toBeVisible();
  await expect(draft).toHaveValue('New draft');
  const sends = await page.evaluate(() => (window as any).chatTest.sends);
  expect(sends).toHaveLength(2); expect(sends[0]).toEqual(sends[1]);
  await expect(page.locator('.chat-message__bubble')).toHaveCount(1);
});

test('deadline shows retry; reconnect alone does not send expired messages', async ({ page }) => {
  await page.clock.install();
  await mountChat(page);
  const draft = page.getByRole('textbox', { name: 'Message the party', exact: true });
  await draft.fill('Expires offline');
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await page.clock.runFor(29_000);
  await expect(page.getByText('Sending…', { exact: true })).toBeVisible();
  await page.clock.runFor(1_001);
  await expect(page.getByText('Not sent', { exact: true })).toBeVisible();
  await expect(page.getByText('Message could not be sent. Retry or discard it.', { exact: true })).toBeVisible();
  await page.evaluate(() => (window as any).chatTest.connect(true));
  await page.clock.runFor(1_000);
  expect(await page.evaluate(() => (window as any).chatTest.sends.length)).toBe(0);
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByText('Sent', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as any).chatTest.sends.length)).toBe(1);
});
