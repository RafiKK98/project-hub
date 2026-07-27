import { devices, defineConfig as playwrightConfig } from "@playwright/test";

export default playwrightConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 7_000 },

  // Tests share a linear story (register → org → project → issue → comment)
  // via test.describe.serial, so parallelism across files is unnecessary and
  // parallelism within a file would break the shared state.
  fullyParallel: false,
  workers: 1,
  retries: process.env["CI"] ? 1 : 0,

  reporter: process.env["CI"]
    ? [["github"], ["html", { open: "never" }]]
    : [["list"]],

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  // Starts both apps if they aren't already running. Locally this reuses
  // your existing `pnpm dev` session; in CI it starts fresh every run.
  webServer: [
    {
      command: "pnpm --filter @projecthub/api dev",
      url: "http://localhost:4000/api/health",
      reuseExistingServer: !process.env["CI"],
      timeout: 60_000,
    },
    {
      command: "pnpm --filter @projecthub/web dev",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env["CI"],
      timeout: 60_000,
    },
  ],
});
