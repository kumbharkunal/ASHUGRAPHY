import { expect, test } from "@playwright/test";
import { contextFor } from "./helpers";

/**
 * If the page's scripts never run (blocked, failed or still loading on a bad connection), the
 * content must not stay hidden: the nav drops in on its own after about four seconds, like the
 * reveal and intro failsafes.
 */
test.describe("resilience", () => {
  test.skip(({ browserName }) => browserName !== "chromium");

  test("the nav appears even when no script runs", async ({ browser }) => {
    const context = await contextFor(browser, 390, { skipIntro: false });
    await context.route(/\/_next\/static\/chunks\/.*\.js/, (route) => route.abort());
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "load" });
    const nav = page.locator("header nav");
    await expect
      .poll(async () => nav.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m42), { timeout: 12_000 })
      .toBeCloseTo(0, 0);
    await expect(page.locator("#hero-title")).toBeVisible({ timeout: 8_000 });
    await context.close();
  });
});
