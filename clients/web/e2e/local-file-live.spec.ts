import { readFile } from "node:fs/promises";
import { test, expect, type Page } from "@playwright/test";

async function pick(
  page: Page,
  button: ReturnType<Page["getByRole"]>,
  name: string,
  bytes: Buffer,
) {
  const dialog = page.waitForEvent("filechooser");
  await button.click();
  const mimeType = name.endsWith(".mkv") ? "video/x-matroska" : "video/mp4";
  await (await dialog).setFiles({ name, mimeType, buffer: bytes });
}
test("local files: filename-only request, different names, decline, explicit start and source replacement", async ({
  browser,
}) => {
  test.skip(
    process.env.WATCHPARTY_LOCAL_MEDIA_E2E !== "1",
    "Requires disposable local backend.",
  );
  test.setTimeout(150000);
  const contexts = await Promise.all([0, 1, 2].map(() => browser.newContext()));
  try {
    const [owner, viewer, declined] = await Promise.all(
      contexts.map((c) => c.newPage()),
    );
    const errors: string[] = [];
    for (const page of [owner, viewer, declined])
      page.on("pageerror", (e) => errors.push(e.message));
    const media = await readFile(
      new URL("./fixtures/player-mkv/sync-long.mp4", import.meta.url),
    );
    const shortMedia = await readFile(
      new URL("./fixtures/player-mkv/movie.mp4", import.meta.url),
    );
    await owner.goto("/?lang=en");
    await owner
      .getByRole("button", { name: "Start a party", exact: true })
      .click();
    await owner
      .getByRole("button", { name: "Start the party", exact: true })
      .click();
    await expect(
      owner.getByRole("textbox", { name: "Message the party", exact: true }),
    ).toBeEnabled();
    const code = await owner.evaluate(() =>
      sessionStorage.getItem("roomio-active-code"),
    );
    for (const page of [viewer, declined]) {
      await page.goto(`/?invite=${code}&lang=en`);
      await page
        .getByRole("button", { name: "Join party", exact: true })
        .click();
      await expect(
        page.getByRole("textbox", { name: "Message the party", exact: true }),
      ).toBeEnabled();
    }
    const starts: string[] = [];
    owner.on("request", (r) => {
      if (r.url().includes("/stream/start")) starts.push(r.postData() || "");
    });
    await pick(
      owner,
      owner.getByRole("button", { name: "Choose file", exact: true }),
      "Owner movie.mp4",
      media,
    );
    await expect(
      owner.getByRole("dialog", { name: "Who’s ready to watch?", exact: true }),
    ).toBeVisible({ timeout: 15000 });
    await expect(
      owner.getByRole("button", { name: "Start with 0", exact: true }),
    ).toBeDisabled();
    await expect(viewer.getByRole("dialog")).toContainText("Owner movie.mp4");
    await declined
      .getByRole("dialog")
      .getByRole("button", { name: "Skip · no video", exact: true })
      .click();
    await expect(
      declined.getByRole("slider", { name: "Playback position", exact: true }),
    ).toHaveCount(0);
    await pick(
      viewer,
      viewer
        .getByRole("dialog")
        .getByRole("button", { name: "Choose file", exact: true }),
      "Different name.mp4",
      shortMedia,
    );
    await expect(
      owner.getByRole("button", { name: "Start with 1", exact: true }),
    )
      .toBeEnabled({ timeout: 30000 })
      .catch(async (error) => {
        console.log("VIEWER", await viewer.locator("body").innerText());
        console.log(
          "VIDEOS",
          await viewer
            .locator("video")
            .evaluateAll((vs) =>
              vs.map((v) => ({
                ready: v.readyState,
                duration: v.duration,
                paused: v.paused,
                src: v.currentSrc,
                error: v.error?.code,
              })),
            ),
        );
        throw error;
      });
    await expect(owner.locator(".group-sync-countdown")).toHaveCount(0);
    expect(starts).toHaveLength(1);
    expect(JSON.parse(starts[0])).toEqual({
      sourceKind: "LOCAL_FILE",
      fileName: "Owner movie.mp4",
    });
    await owner
      .getByRole("button", { name: "Start with 1", exact: true })
      .click();
    for (const page of [owner, viewer])
      await expect(
        page.getByRole("button", { name: "Pause", exact: true }),
      ).toBeVisible({ timeout: 30000 });
    await expect(
      declined.getByRole("slider", { name: "Playback position", exact: true }),
    ).toHaveCount(0);
    await viewer.getByRole("button", { name: "Pause", exact: true }).click();
    const viewerBefore = await viewer
      .getByRole("slider", { name: "Playback position", exact: true })
      .inputValue();
    await owner.waitForTimeout(2000);
    await owner.getByRole("button", { name: "Pause", exact: true }).click();
    await owner
      .getByRole("slider", { name: "Playback position", exact: true })
      .fill("60");
    await owner.locator(".sync-band").getByRole("button").click();
    await owner
      .getByRole("dialog")
      .getByRole("button", { name: /Ask.*sync/i })
      .click();
    await viewer
      .getByRole("dialog")
      .getByRole("button", { name: /Accept/ })
      .click();
    await owner
      .getByRole("dialog")
      .getByRole("button", { name: "Start with 1", exact: true })
      .click();
    for (const page of [owner, viewer, declined])
      await expect(page.locator(".md-snackbar")).toContainText(
        "Couldn’t sync. Back to where you were.",
        { timeout: 25000 },
      );
    await expect
      .poll(async () =>
        Math.abs(
          Number(
            await viewer
              .getByRole("slider", { name: "Playback position", exact: true })
              .inputValue(),
          ) - Number(viewerBefore),
        ),
      )
      .toBeLessThan(0.25);
    await expect(
      viewer.getByRole("button", { name: "Play", exact: true }),
    ).toBeVisible();
    await expect(
      owner.getByRole("slider", { name: "Playback position", exact: true }),
    ).toHaveValue("60");
    await expect(owner.getByRole("alert")).toHaveCount(0);
    await owner.getByRole("button", { name: "Change", exact: true }).click();
    const choice = owner.getByRole("dialog", {
      name: "Choose video",
      exact: true,
    });
    await expect(choice.locator(".media-source-tiles")).toBeVisible();
    await pick(
      owner,
      choice.getByRole("button", { name: "Local file", exact: true }),
      "Replacement.mp4",
      media,
    );
    await expect(
      owner.getByRole("dialog", { name: "Who’s ready to watch?", exact: true }),
    ).toContainText("Replacement.mp4");
    await expect(viewer.getByRole("dialog")).toContainText("Replacement.mp4");
    await expect(
      viewer.getByRole("slider", { name: "Playback position", exact: true }),
    ).toHaveCount(0);
    expect(JSON.parse(starts[1])).toMatchObject({
      replace: true,
      revision: 1,
      sourceKind: "LOCAL_FILE",
      fileName: "Replacement.mp4",
    });
    expect(errors).toEqual([]);
  } finally {
    await Promise.all(contexts.map((c) => c.close()));
  }
});

test("a local MKV can stay paused past the startup deadline and then play in AVPlayer", async ({ page }) => {
  test.skip(process.env.WATCHPARTY_LOCAL_MEDIA_E2E !== "1", "Requires disposable local backend.");
  const media = await readFile(new URL("./fixtures/player-mkv/movie.mkv", import.meta.url));
  await page.goto("/?lang=en");
  await page.getByRole("button", { name: "Start a party", exact: true }).click();
  await page.getByRole("button", { name: "Start the party", exact: true }).click();
  await pick(page, page.getByRole("button", { name: "Choose file", exact: true }), "Movie.mkv", media);
  const play = page.getByRole("button", { name: "Play video", exact: true });
  await expect(play).toBeVisible();
  // The previous first-frame watchdog fired 30 seconds after file selection.
  await page.waitForTimeout(31_000);
  await expect(play).toBeVisible();
  await expect(page.getByText("Switched to browser playback.", { exact: true })).toHaveCount(0);
  await play.click();
  await expect.poll(
    () => page.locator(".integrated-player video").evaluateAll(videos => videos[0]?.currentTime ?? 0),
    { timeout: 10_000 },
  ).toBeGreaterThan(0.1);
});

test('two local HEVC software players prepare and advance together after the room countdown', async ({ browser }) => {
  test.skip(process.env.WATCHPARTY_LOCAL_MEDIA_E2E !== '1', 'Requires disposable local backend.');
  const media = await readFile(new URL('./fixtures/player-mkv/hevc-main10.mkv', import.meta.url));
  const contexts = await Promise.all([browser.newContext(), browser.newContext()]);
  try {
    const [owner, viewer] = await Promise.all(contexts.map(async context => {
      await context.addInitScript(() => {
        const supported = MediaSource.isTypeSupported.bind(MediaSource);
        MediaSource.isTypeSupported = type => !/hvc1|hev1/i.test(type) && supported(type);
      });
      return context.newPage();
    }));
    await owner.goto('/?lang=en');
    await owner.getByRole('button', { name: 'Start a party', exact: true }).click();
    await owner.getByRole('button', { name: 'Start the party', exact: true }).click();
    await expect(owner.getByRole('textbox', { name: 'Message the party' })).toBeEnabled();
    const code = await owner.evaluate(() => sessionStorage.getItem('roomio-active-code'));
    await viewer.goto(`/?invite=${code}&lang=en`);
    await viewer.getByRole('button', { name: 'Join party', exact: true }).click();
    await expect(viewer.getByRole('textbox', { name: 'Message the party' })).toBeEnabled();
    await pick(owner, owner.getByRole('button', { name: 'Choose file', exact: true }), 'owner.mkv', media);
    await pick(viewer, viewer.getByRole('dialog').getByRole('button', { name: 'Choose file', exact: true }), 'viewer.mkv', media);
    await owner.getByRole('button', { name: 'Start with 1', exact: true }).click();
    await Promise.all([owner, viewer].map(page => expect(page.locator('.group-sync-countdown')).toBeVisible()));
    await expect.poll(async () => {
      const positions = await Promise.all([owner, viewer].map(page => page.evaluate(() => {
        const player = (window as any).AVPlayer.Instances[0];
        const stats = player.getStats();
        return player.isMSE() || !stats.videoFrameRenderCount ? 0 : Number(stats.videoCurrentTime);
      })));
      return Math.min(...positions) > 500 && Math.abs(positions[0] - positions[1]) < 500;
    }, { timeout: 20000 }).toBe(true);
  } finally {
    await Promise.all(contexts.map(context => context.close()));
  }
});
