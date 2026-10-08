import { defineConfig, devices } from "@playwright/test";

/** Dedicated QA port so tests never attach to another local app on the default 3000. */
const PORT = Number(process.env.QA_PORT ?? 3107);

/**
 * Runs against the production server (`npm run build` first). The server is reused if it is
 * already running on the QA port.
 */
export default defineConfig({
  testDir: "./tests",
  outputDir: "./test-results",
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "off",
    screenshot: "off",
  },
  webServer: {
    command: `npm run start -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
