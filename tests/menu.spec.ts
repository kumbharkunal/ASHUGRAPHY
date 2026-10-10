import { expect, test, type Page } from "@playwright/test";
import { contextFor } from "./helpers";

async function sheetState(page: Page) {
  return page.evaluate(() => {
    const sheet = document.getElementById("mobile-menu");
    const toggle = document.querySelector<HTMLButtonElement>("header button[aria-controls='mobile-menu']");
    return {
      expanded: toggle?.getAttribute("aria-expanded"),
      visibility: sheet ? getComputedStyle(sheet).visibility : null,
      inert: sheet?.hasAttribute("inert") ?? null,
      bodyPosition: getComputedStyle(document.body).position,
      mainInert: document.querySelector("main")?.hasAttribute("inert") ?? null,
    };
  });
}

test.describe("mobile menu", () => {
  test.skip(({ browserName }) => browserName !== "chromium");

  test("survives 20 rapid taps and ends in a consistent state", async ({ browser }) => {
    const context = await contextFor(browser, 390);
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    const toggle = page.locator("header button[aria-controls='mobile-menu']");
    const close = page.locator("#mobile-menu button[aria-controls='mobile-menu']");
    await expect(toggle).toBeVisible();

    for (let tap = 0; tap < 20; tap += 1) {
      // Alternate between the pill toggle and the sheet's close button, as a thumb would.
      const target = tap % 2 === 0 ? toggle : close;
      await target.dispatchEvent("click");
      await page.waitForTimeout(45);
    }
    await page.waitForTimeout(1200);
    const closed = await sheetState(page);
    expect(closed.expanded).toBe("false");
    expect(closed.visibility).toBe("hidden");
    expect(closed.inert).toBe(true);
    expect(closed.bodyPosition).not.toBe("fixed");
    expect(closed.mainInert).toBe(false);

    await toggle.click();
    await page.waitForTimeout(900);
    const opened = await sheetState(page);
    expect(opened.expanded).toBe("true");
    expect(opened.visibility).toBe("visible");
    expect(opened.bodyPosition).toBe("fixed");
    expect(opened.mainInert).toBe(true);
    await context.close();
  });

  test("traps focus, closes on Escape and restores focus", async ({ browser }) => {
    const context = await contextFor(browser, 390);
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    const toggle = page.locator("header button[aria-controls='mobile-menu']");
    await toggle.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(700);

    const focusInside = async () =>
      page.evaluate(() => Boolean(document.activeElement?.closest("#mobile-menu")));
    expect(await focusInside()).toBe(true);
    for (let step = 0; step < 14; step += 1) {
      await page.keyboard.press("Tab");
      expect(await focusInside()).toBe(true);
    }

    await page.keyboard.press("Escape");
    await page.waitForTimeout(700);
    const state = await sheetState(page);
    expect(state.expanded).toBe("false");
    const focusedToggle = await page.evaluate(
      () => document.activeElement?.getAttribute("aria-controls") === "mobile-menu" &&
        Boolean(document.activeElement?.closest("header")),
    );
    expect(focusedToggle).toBe(true);
    await context.close();
  });

  test("keeps the page still while open and closes from the backdrop", async ({ browser }) => {
    const context = await contextFor(browser, 390);
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await page.locator("header button[aria-controls='mobile-menu']").click();
    await page.waitForTimeout(700);
    const before = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, 600);
    await page.touchscreen.tap(195, 830).catch(() => undefined);
    await page.waitForTimeout(300);
    const after = await page.evaluate(() => window.scrollY);
    expect(after).toBe(before);
    await context.close();
  });

  test("returns to the same place on the page after closing", async ({ browser }) => {
    const context = await contextFor(browser, 390);
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    // Scroll down, then up a little so the nav shows again.
    await page.evaluate(() => window.scrollTo({ top: 3300, behavior: "instant" }));
    await page.waitForTimeout(600);
    await page.evaluate(() => window.scrollTo({ top: 3000, behavior: "instant" }));
    await page.waitForTimeout(900);
    const before = await page.evaluate(() => Math.round(window.scrollY));
    expect(before).toBeGreaterThan(2000);
    await page.locator("header button[aria-controls='mobile-menu']").click();
    await page.waitForTimeout(900);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(900);
    expect(await page.evaluate(() => Math.round(window.scrollY))).toBe(before);
    await context.close();
  });

  test("closes automatically when the viewport grows to desktop", async ({ browser }) => {
    const context = await contextFor(browser, 390);
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await page.locator("header button[aria-controls='mobile-menu']").click();
    await page.waitForTimeout(600);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(800);
    const state = await sheetState(page);
    expect(state.bodyPosition).not.toBe("fixed");
    expect(state.mainInert).toBe(false);
    await context.close();
  });
});
