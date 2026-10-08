import { expect, test } from "@playwright/test";
import { contextFor, scrollThrough } from "./helpers";

/**
 * A clean console: no errors, warnings, hydration mismatches or uncaught exceptions while the page
 * loads (with the first-visit intro), scrolls through every section and opens its overlays.
 */
test.describe("console", () => {
  for (const width of [390, 1440]) {
    test(`stays clean at ${width}px`, async ({ browser }) => {
      const context = await contextFor(browser, width, { skipIntro: false });
      const page = await context.newPage();
      const messages: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error" || message.type() === "warning") messages.push(`${message.type()}: ${message.text()}`);
      });
      page.on("pageerror", (error) => messages.push(`pageerror: ${error.message}`));

      // A first blank navigation lets device emulation settle, so the hero preload sees the real
      // viewport (a fresh headless page can start out landscape for an instant).
      await page.goto("about:blank");
      await page.goto("/", { waitUntil: "networkidle" });
      await page.waitForTimeout(2600);
      await page.mouse.move(300, 300, { steps: 5 });
      await scrollThrough(page);
      await page.waitForTimeout(800);

      // Open and close the story viewer from the first frame.
      await page.locator("[data-story-card] button").first().evaluate((button: HTMLButtonElement) => button.click());
      await page.waitForTimeout(700);
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);

      expect(messages).toEqual([]);
      await context.close();
    });
  }
});
