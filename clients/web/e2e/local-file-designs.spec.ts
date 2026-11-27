import { test, expect, type Page } from "@playwright/test";

async function chooseSystemFile(
  page: Page,
  button: ReturnType<Page["getByRole"]>,
  name = "Walter Mitty.mp4",
) {
  const chooser = page.waitForEvent("filechooser");
  await button.click();
  await (
    await chooser
  ).setFiles({
    name,
    mimeType: "video/mp4",
    buffer: Buffer.from("preview-only"),
  });
}

test("owner requests files, sees mixed responses and starts only ready viewers", async ({
  page,
}) => {
  await page.goto("/?preview=local-file&lang=en");
  await chooseSystemFile(
    page,
    page.getByRole("button", { name: "Choose file", exact: true }),
  );
  await expect(
    page.getByRole("dialog", { name: "Opening file…" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Start with 0", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Preview: show mixed replies", exact: true })
    .click();
  await expect(page.locator(".group-sync-person--accepted")).toContainText(
    "Ellis",
  );
  await expect(page.locator(".group-sync-person--declined")).toContainText(
    "Not watching",
  );
  await page.getByRole("button", { name: "Start with 1", exact: true }).click();
  await expect(
    page.getByText("Getting everyone ready", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Cancel request", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator(".group-sync-countdown")).toBeVisible();
  await expect(page.locator(".sync-entry")).toContainText("Playing for you", {
    timeout: 10000,
  });
  const seek = page.getByRole("slider", {
    name: "Playback position",
    exact: true,
  });
  await seek.fill("612");
  await page
    .getByRole("button", { name: "Sync together", exact: true })
    .click();
  await page.getByRole("button", { name: "Start with 1", exact: true }).click();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page
    .getByRole("button", { name: "Simulate sync failure", exact: true })
    .click();
  await expect(page.locator(".md-snackbar")).toContainText(
    "Couldn’t sync. Back to where you were.",
  );
  await expect(seek).toHaveValue("612");
  await expect(seek).toBeEnabled();
  await expect(
    page.getByRole("button", { name: "Pause", exact: true }),
  ).toBeVisible();
  await page.waitForTimeout(2000);
  await expect(page.locator(".group-sync-countdown")).toHaveCount(0);
});

test("viewer can decline, then select a different file and recover from a sync error", async ({
  page,
}) => {
  const outgoing: string[] = [];
  page.on("request", (request) => {
    if (request.method() !== "GET") outgoing.push(request.url());
  });
  await page.goto("/?preview=local-file&role=viewer&lang=en");
  await page
    .getByRole("button", { name: "Skip · no video", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "You’re sitting this one out" }),
  ).toBeVisible();
  await expect(
    page.getByRole("slider", { name: "Playback position", exact: true }),
  ).toHaveCount(0);
  await chooseSystemFile(
    page,
    page.getByRole("button", { name: "Choose file", exact: true }),
    "A different movie.mkv",
  );
  await expect(
    page.getByText("Waiting for the owner…", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("dialog", { name: "Let’s watch a file" }),
  ).toContainText("A different movie.mkv");
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page
    .getByRole("button", { name: "Simulate sync failure", exact: true })
    .click();
  await expect(page.locator(".md-snackbar")).toContainText(
    "Couldn’t sync. Back to where you were.",
  );
  await expect(page.getByRole("alert")).toHaveCount(0);
  const seek = page.getByRole("slider", {
    name: "Playback position",
    exact: true,
  });
  await expect(seek).toBeEnabled();
  await expect(seek).toHaveValue("0");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await seek.fill("620");
  await page
    .getByRole("button", { name: "Simulate sync failure", exact: true })
    .click();
  await expect(seek).toHaveValue("620");
  await expect(
    page.getByRole("button", { name: "Pause", exact: true }),
  ).toBeVisible();
  expect(outgoing).toEqual([]);
});

test("compact Persian large text fits, supports file picking and offline recovery", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(
    "/?preview=local-file&role=viewer&lang=fa&theme=light&scale=large",
  );
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await chooseSystemFile(
    page,
    page
      .getByRole("dialog", { name: "بیا یه فایل ببینیم" })
      .getByRole("button", { name: "انتخاب فایل", exact: true }),
  );
  await expect(
    page.getByText("منتظر تصمیم میزبان…", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("dialog", { name: "بیا یه فایل ببینیم" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({ path: "/tmp/watchparty-local-fa.png" });
  await page.getByRole("button", { name: "بستن", exact: true }).click();
  await page.getByRole("button", { name: "قطع اتصال", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "نمایش درخواست فایل", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "اتصال دوباره", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "نمایش درخواست فایل", exact: true }),
  ).toBeEnabled();
});

test("Change offers file or stream, and cancelling preserves the current file", async ({
  page,
}) => {
  await page.goto("/?preview=local-file&lang=en");
  await chooseSystemFile(
    page,
    page.getByRole("button", { name: "Choose file", exact: true }),
  );
  await expect(
    page.getByRole("dialog", { name: "Who’s ready to watch?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.getByRole("button", { name: "Change", exact: true }).click();
  const change = page.getByRole("dialog", {
    name: "Choose video",
    exact: true,
  });
  await expect(
    change.getByRole("button", { name: "Local file", exact: true }),
  ).toBeVisible();
  const chooser = page.waitForEvent("filechooser");
  await change.getByRole("button", { name: "Local file", exact: true }).click();
  await (await chooser).setFiles([]);
  await expect(change).toBeVisible();
  await change.getByRole("button", { name: "Stream URL", exact: true }).click();
  const stream = page.getByRole("dialog", {
    name: "Stream from a URL",
    exact: true,
  });
  await expect(
    stream.getByRole("button", { name: "Start stream", exact: true }),
  ).toBeDisabled();
  await stream.getByRole("button", { name: "Close", exact: true }).click();
  await expect(page.locator(".source-row")).toContainText("Walter Mitty.mp4");
  await page.getByRole("button", { name: "Change", exact: true }).click();
  await change.getByRole("button", { name: "Stream URL", exact: true }).click();
  await stream
    .getByRole("textbox", { name: "Direct video URL", exact: true })
    .fill("https://example.org/movie.mp4");
  await expect(
    stream.getByRole("button", { name: "Start stream", exact: true }),
  ).toBeEnabled();
  await stream.getByRole("button", { name: "Back", exact: true }).click();
  await chooseSystemFile(
    page,
    change.getByRole("button", { name: "Local file", exact: true }),
    "Replacement.mp4",
  );
  await expect(
    page.getByRole("dialog", { name: "Who’s ready to watch?" }),
  ).toContainText("Replacement.mp4");
});

for (const language of ["en", "fa"]) {
  test(`Selected tiles: ${language} source actions work`, async ({ page }) => {
    const fa = language === "fa";
    if (fa) await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(
      `/?preview=local-file&dialog=choose-video&lang=${language}${fa ? "&theme=light&scale=large" : ""}`,
    );
    const dialog = page.getByRole("dialog", {
      name: fa ? "انتخاب فیلم" : "Choose video",
      exact: true,
    });
    await expect(dialog.locator(".video-source-options--tiles")).toBeVisible();
    await expect(
      page.getByLabel("Choose video design", { exact: true }),
    ).toHaveCount(0);
    await dialog
      .getByRole("button", {
        name: fa ? "لینک فیلم" : "Stream URL",
        exact: true,
      })
      .click();
    const stream = page.getByRole("dialog", {
      name: fa ? "پخش از لینک" : "Stream from a URL",
      exact: true,
    });
    await expect(stream.getByRole("textbox")).toBeVisible();
    await stream
      .getByRole("button", { name: fa ? "برگشت" : "Back", exact: true })
      .click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await chooseSystemFile(
      page,
      dialog.getByRole("button", {
        name: fa ? "فایل محلی" : "Local file",
        exact: true,
      }),
    );
    await expect(
      page.getByRole("dialog", {
        name: fa ? "کی آماده‌ست ببینیم؟" : "Who’s ready to watch?",
        exact: true,
      }),
    ).toContainText("Walter Mitty.mp4");
  });
}
