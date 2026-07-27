import { expect, test } from "@playwright/test";
import { generateTestUser } from "./fixtures/test-user";

test.describe("Authentication", () => {
  test("register creates an account and lands on the dashboard", async ({
    page,
  }) => {
    const user = generateTestUser();

    await page.goto("/register");
    await page.getByLabel("Full name").fill(user.name);
    await page.getByLabel("Email").fill(user.email);
    await page.locator("#password").fill(user.password);
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL("/dashboard", { timeout: 10_000 });
  });

  test("invalid credentials show an error and keep the user on /login", async ({
    page,
  }) => {
    await page.goto("/login");
    await page
      .getByLabel("Email")
      .fill("nobody-e2e-does-not-exist@example.com");
    await page.locator("#password").fill("WrongPass123!");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated visitors are redirected away from protected routes", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("an authenticated user visiting /login is redirected to the dashboard", async ({
    page,
  }) => {
    const user = generateTestUser();

    await page.goto("/register");
    await page.getByLabel("Full name").fill(user.name);
    await page.getByLabel("Email").fill(user.email);
    await page.locator("#password").fill(user.password);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL("/dashboard");

    await page.goto("/login");
    await expect(page).toHaveURL("/dashboard");
  });
});
