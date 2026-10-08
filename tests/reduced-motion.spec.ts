import { expect, test } from "@playwright/test";
import { contextFor, scrollThrough } from "./helpers";

test.describe("reduced motion", () => {
  test.skip(({ browserName }) => browserName !== "chromium");

  for (const width of [390, 1440]) {
    test(`at ${width}px nothing pins, smooths, scrubs or stays hidden`, async ({ browser }) => {
      const context = await contextFor(browser, width, { reducedMotion: "reduce" });
      const page = await context.newPage();
      await page.goto("/", { waitUntil: "networkidle" });
      await page.mouse.move(400, 300, { steps: 6 });
      await scrollThrough(page);
      await page.waitForTimeout(800);

      // No pinned sections and no WebGL layer.
      await expect(page.locator(".pin-spacer")).toHaveCount(0);
      await expect(page.locator(".hero-gl canvas")).toHaveCount(0);

      // Every reveal target ends fully visible.
      const hidden = await page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"))
          .filter((element) => {
            const style = getComputedStyle(element);
            return style.visibility === "hidden" || Number(style.opacity) < 0.99;
          })
          .map((element) => element.outerHTML.slice(0, 80)),
      );
      expect(hidden).toEqual([]);

      // The manifesto keeps whole words (no splitting) at full strength.
      const dimWords = await page.evaluate(
        () => Array.from(document.querySelectorAll<HTMLElement>("[data-manifesto] div")).filter((word) => Number(getComputedStyle(word).opacity) < 0.99).length,
      );
      expect(dimWords).toBe(0);

      // Wheel scrolling is native: Lenis never enters its smooth state.
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.mouse.wheel(0, 600);
      await page.waitForTimeout(60);
      const smooth = await page.evaluate(() => document.documentElement.classList.contains("lenis-smooth"));
      expect(smooth).toBe(false);
      await context.close();
    });
  }
});
