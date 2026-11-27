import { test, expect } from "@playwright/test";
for (const variant of ["inline", "side", "sheet"]) {
  test(`${variant}: owner locks accepted group and completes countdown`, async ({
    page,
  }) => {
    await page.clock.install();
    await page.goto(`/?preview=sync&variant=${variant}&lang=en`);
    await page
      .getByRole("button", { name: "Sync together", exact: true })
      .click();
    if (variant === "sheet") await page.getByRole("button", { name: "Ask everyone to sync", exact: true }).click();
    await expect(
      page.getByRole("slider", { name: "Playback position", exact: true }),
    ).toBeDisabled();
    await page.clock.runFor(6000);
    await page
      .getByRole("button", { name: "Start with 3", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Cancel request", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.locator(".sync-preparation .md-expressive-loading"),
    ).toBeVisible();
    await page.clock.runFor(3100);
    await expect(page.locator(".sync-countdown strong")).toHaveText("3");
    await page.clock.runFor(4000);
    await expect(
      page.getByRole("slider", { name: "Playback position", exact: true }),
    ).toBeEnabled();
    await expect(page.locator(".sync-entry")).toContainText("You’re watching");
  });
  test(`${variant}: viewer acceptance is revocable and declining stays independent`, async ({
    page,
  }) => {
    await page.clock.install();
    await page.goto(
      `/?preview=sync&variant=${variant}&role=viewer&scene=inviting&lang=en`,
    );
    await expect(
      page.getByRole("slider", { name: "Playback position", exact: true }),
    ).toBeEnabled();
    await page
      .getByRole("button", { name: "Accept & pause", exact: true })
      .click();
    await expect(
      page.getByRole("slider", { name: "Playback position", exact: true }),
    ).toBeDisabled();
    await page
      .getByRole("button", { name: "Change my mind & keep watching", exact: true })
      .click();
    await expect(
      page.getByRole("slider", { name: "Playback position", exact: true }),
    ).toBeEnabled();
    if (variant === "sheet") {
      await expect(page.getByRole("dialog")).not.toBeVisible();
      await page.getByRole("button", { name: "View sync", exact: true }).click();
    }
    await page
      .getByRole("button", { name: "Keep watching", exact: true })
      .click();
    if (variant === "sheet")
      await page
        .getByRole("button", { name: "View sync", exact: true })
        .click();
    await expect(page.locator(".sync-entry")).toContainText("You’re watching");
    if (variant === "sheet")
      await page.getByRole("button", { name: "Close", exact: true }).click();
    await page.locator(".sync-simulator summary").click();
    await page
      .getByRole("button", { name: "Owner starts now", exact: true })
      .click();
    await page.clock.runFor(3100);
    await expect(page.locator(".sync-countdown")).toHaveCount(0);
    await expect(
      page.getByRole("slider", { name: "Playback position", exact: true }),
    ).toBeEnabled();
  });
}
test("preparation deadline excludes a disconnected viewer and continues", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/?preview=sync&variant=inline&lang=en");
  await page.locator(".sync-simulator summary").click();
  await page.getByLabel("Connection scenario").selectOption("slow");
  await page
    .getByRole("button", { name: "Sync together", exact: true })
    .click();
  await page.getByLabel("Skeleton Detective response").selectOption("accepted");
  await page.getByRole("button", { name: "Start with 2", exact: true }).click();
  await page.clock.runFor(13500);
  await expect(
    page.locator(".md-snackbar").getByText("Started with ready viewers.", { exact: false }),
  ).toBeVisible();
  await expect(page.locator(".sync-recovery")).toHaveCount(0);
  await expect(
    page.getByRole("slider", { name: "Playback position", exact: true }),
  ).toBeEnabled();
});
test("owner failure ends committed attempt automatically with recovery", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/?preview=sync&variant=inline&lang=en");
  await page.locator(".sync-simulator summary").click();
  await page.getByLabel("Connection scenario").selectOption("failure");
  await page
    .getByRole("button", { name: "Sync together", exact: true })
    .click();
  await page.getByRole("button", { name: "Start with 1", exact: true }).click();
  await page.clock.runFor(9500);
  await expect(
    page.getByRole("heading", { name: "We couldn’t start together" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Back to the movie", exact: true })
    .click();
  await expect(
    page.getByRole("slider", { name: "Playback position", exact: true }),
  ).toBeEnabled();
});
test("all directions fit mobile Persian dark large text", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const variant of ["inline", "side", "sheet"]) {
    await page.goto(
      `/?preview=sync&variant=${variant}&role=viewer&scene=inviting&theme=dark&scale=large&lang=fa`,
    );
    await expect(
      page.getByRole("button", { name: "پذیرش و توقف فیلم", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole("button", { name: "پذیرش و توقف فیلم", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "بیخیال، فیلممو ادامه میدم", exact: true }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  }
});

test('withdrawing resumes a viewer who was already paused', async ({ page }) => {
  await page.goto('/?preview=sync&variant=inline&role=viewer&scene=inviting&lang=en');
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.getByRole('button', { name: 'Accept & pause', exact: true }).click();
  await page.getByRole('button', { name: 'Change my mind & keep watching', exact: true }).click();
  await expect(page.locator('.sync-entry')).toContainText('You’re watching');
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeEnabled();
});
test('private catch-up seeks after local scrubbing without opening an invitation', async ({ page }) => {
  await page.clock.install();
  await page.goto('/?preview=sync&role=viewer&lang=en');
  await page.getByRole('button', { name: 'Catch up to owner', exact: true }).waitFor();
  await page.clock.pauseAt(new Date(Date.now() + 2000));
  const seek = page.getByRole('slider', { name: 'Playback position', exact: true });
  await seek.fill('600');
  await page.getByRole('button', { name: 'Catch up to owner', exact: true }).click();
  await expect(seek).toHaveValue('1122');
  await expect(page.getByRole('region', { name: 'Group synchronization' })).toHaveCount(0);
});

test('selected sheet follows live playback until Ask captures and pauses it', async ({ page }) => {
  const now = new Date();
  await page.clock.install({ time: now });
  await page.goto('/?preview=sync&variant=sheet&role=owner&lang=en');
  await page.addStyleTag({ content: '* { animation: none !important; transition: none !important; }' });
  await page.getByRole('button', { name: 'Sync together', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveAccessibleName('Sync together');
  await expect(page.locator('.sync-roster')).toHaveCount(0);
  await page.clock.pauseAt(new Date(Date.now() + 2000));
  const initial = (await page.locator('.sync-target strong').innerText()).split(':').map(Number);
  const next = initial[0] * 60 + initial[1] + 3;
  const expected = `${Math.floor(next / 60)}:${String(next % 60).padStart(2, '0')}`;
  await page.clock.runFor(3000);
  await expect(page.locator('.sync-target strong')).toHaveText(expected);
  await expect(page.getByRole('slider', { name: 'Playback position', exact: true })).toBeEnabled();
  await expect(page.locator('.sync-entry')).toContainText('You’re watching');
  await page.getByRole('button', { name: 'Ask everyone to sync', exact: true }).click();
  await expect(page.getByRole('slider', { name: 'Playback position', exact: true })).toBeDisabled();
  await expect(page.locator('.sync-roster')).toBeVisible();
  await page.clock.runFor(3000);
  await expect(page.locator('.sync-target strong')).toHaveText(expected);
  await expect(page.getByRole('button', { name: 'Cancel request', exact: true })).toBeVisible();
});

test('viewer withdrawal closes the sheet and resumes from the accepted position', async ({ page }) => {
  await page.clock.install();
  await page.goto('/?preview=sync&variant=sheet&role=viewer&scene=inviting&lang=en');
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.addStyleTag({ content: '* { animation: none !important; transition: none !important; }' });
  await page.clock.pauseAt(new Date(Date.now() + 2000));
  const seek = page.getByRole('slider', { name: 'Playback position', exact: true });
  await seek.fill('600');
  await page.getByRole('button', { name: 'View sync', exact: true }).click();
  await page.getByRole('button', { name: 'Accept & pause', exact: true }).click();
  await page.clock.runFor(2000);
  await expect(seek).toHaveValue('600');
  await page.getByRole('button', { name: 'Change my mind & keep watching', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(seek).toHaveValue('600');
  await expect(page.locator('.sync-entry')).toContainText('You’re watching');
  await page.clock.runFor(1000);
  await expect(seek).toHaveValue('601');
});

test('viewers do not receive the owner-only recovery completion snackbar or card', async ({ page }) => {
  await page.clock.install();
  await page.goto('/?preview=sync&variant=inline&role=viewer&lang=en');
  await page.locator('.sync-simulator summary').click();
  await page.getByLabel('Connection scenario').selectOption('slow');
  await page.getByRole('button', { name: 'Receive owner invitation', exact: true }).click();
  await page.getByRole('button', { name: 'Accept & pause', exact: true }).click();
  await page.getByRole('button', { name: 'Owner starts now', exact: true }).click();
  await page.clock.runFor(13500);
  await expect(page.locator('.sync-entry')).not.toContainText('Paused for sync');
  await expect(page.locator('.sync-recovery')).toHaveCount(0);
  await expect(page.getByText('Started with ready viewers.', { exact: false })).toHaveCount(0);
});
