import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { contextFor, scrollThrough } from "./helpers";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/** Violations as readable lines, so a failure says what and where. */
async function violations(page: Page): Promise<string[]> {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return results.violations.map(
    (violation) =>
      `${violation.id} (${violation.impact}): ${violation.nodes
        .slice(0, 4)
        .map((node) => node.target.join(" "))
        .join(" | ")}`,
  );
}

test.describe("accessibility (axe, WCAG 2.2 A and AA)", () => {
  test.skip(({ browserName }) => browserName !== "chromium");

  for (const width of [390, 1440]) {
    test(`home at ${width}px after every section has revealed`, async ({ browser }) => {
      const context = await contextFor(browser, width);
      const page = await context.newPage();
      await page.goto("/", { waitUntil: "networkidle" });
      await scrollThrough(page);
      await page.waitForTimeout(1500);
      expect(await violations(page)).toEqual([]);
      await context.close();
    });
  }

  test("home with reduced motion", async ({ browser }) => {
    const context = await contextFor(browser, 1440, { reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await scrollThrough(page);
    await page.waitForTimeout(800);
    expect(await violations(page)).toEqual([]);
    await context.close();
  });

  test("mobile menu open", async ({ browser }) => {
    const context = await contextFor(browser, 390);
    const page = await context.newPage();
    await page.goto("/", { waitUntil: "networkidle" });
    await page.locator("header button[aria-controls='mobile-menu']").click();
    await page.waitForTimeout(900);
    expect(await violations(page)).toEqual([]);
    await context.close();
  });

  test("404 page", async ({ browser }) => {
    const context = await contextFor(browser, 390);
    const page = await context.newPage();
    await page.goto("/no-such-frame", { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    expect(await violations(page)).toEqual([]);
    await context.close();
  });
});
