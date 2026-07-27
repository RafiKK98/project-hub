import { expect, test, type Page } from "@playwright/test";
import { generateTestUser } from "./fixtures/test-user";

async function login(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/dashboard");
}

test.describe.serial("Core project workflow", () => {
  const user = generateTestUser();
  const orgName = `E2E Org ${Date.now()}`;
  const projectName = "E2E Project";
  const projectIdentifier = `E2E${Math.floor(Math.random() * 90 + 10)}`;
  const issueTitle = "E2E test issue for board verification";

  // Captured after org creation since the slug is server-generated (slugify)
  let orgSlug = "";

  test("register a new account", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Full name").fill(user.name);
    await page.getByLabel("Email").fill(user.email);
    await page.locator("#password").fill(user.password);
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL("/dashboard");
  });

  test("create an organization", async ({ page }) => {
    await login(page, user.email, user.password);

    await page.goto("/orgs/new");
    await page.getByLabel("Organization name").fill(orgName);
    await page.getByRole("button", { name: "Create organization" }).click();

    await expect(page).toHaveURL(/\/orgs\/[^/]+$/, { timeout: 10_000 });
    await expect(page.getByRole("heading", { name: orgName })).toBeVisible();
    orgSlug = page.url().split("/").filter(Boolean).pop()!;
  });

  test("create a project inside the organization", async ({ page }) => {
    await login(page, user.email, user.password);

    await page.goto(`/orgs/${orgSlug}`);
    await page.getByRole("button", { name: "New project" }).click();
    await expect(page).toHaveURL(new RegExp(`/orgs/${orgSlug}/projects/new$`));

    await page.getByLabel("Project name").fill(projectName);
    await page.getByLabel("Project identifier").fill(projectIdentifier);
    await page.getByRole("button", { name: "Create project" }).click();

    await expect(page).toHaveURL(
      new RegExp(`/orgs/${orgSlug}/projects/${projectIdentifier}$`),
      { timeout: 10_000 },
    );
    await expect(
      page.getByRole("heading", { name: projectName }),
    ).toBeVisible();
  });

  test("create an issue and see it on the board", async ({ page }) => {
    await login(page, user.email, user.password);

    await page.goto(`/orgs/${orgSlug}/projects/${projectIdentifier}`);
    await page.getByRole("button", { name: "New issue" }).click();

    await page.getByLabel("Title").fill(issueTitle);
    await page.getByRole("button", { name: "Create issue" }).click();

    await expect(page).toHaveURL(/\/issues\/\d+$/, { timeout: 10_000 });
    await expect(page.locator("textarea").first()).toHaveValue(issueTitle);

    // Confirm it also shows up back on the project board/list
    await page.goto(`/orgs/${orgSlug}/projects/${projectIdentifier}`);
    await expect(page.getByText(issueTitle)).toBeVisible();
  });

  test("add a comment to the issue", async ({ page }) => {
    await login(page, user.email, user.password);

    await page.goto(`/orgs/${orgSlug}/projects/${projectIdentifier}`);
    await page.getByText(issueTitle).click();
    await expect(page).toHaveURL(/\/issues\/\d+$/, { timeout: 10_000 });
    await expect(page.locator("textarea").first()).toHaveValue(issueTitle);

    const commentText = `Automated e2e comment ${Date.now()}`;
    await page.getByPlaceholder("Leave a comment...").fill(commentText);
    await page.getByRole("button", { name: "Comment" }).click();

    await expect(page.getByText(commentText)).toBeVisible({ timeout: 10_000 });
  });
});
