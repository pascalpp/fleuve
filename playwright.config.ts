import { defineConfig } from '@playwright/test';

const slowMo = Number(process.env.slow) || 250;

export default defineConfig({
  webServer: process.env.CI
    ? {
        command: 'npm run build && npm run preview',
        port: 4173,
      }
    : undefined,
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? 'html' : 'list',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.CI
      ? undefined
      : process.env.PRODUCTION
        ? 'https://fleuve.pascal.com'
        : 'https://fleuve.dev.localhost',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    launchOptions: {
      slowMo,
      timeout: slowMo * 30 + 30000,
    },
  },
});
