import { expect, test } from "@playwright/test";

const hasAuthEnv = Boolean(process.env.E2E_EMAIL && process.env.E2E_PASSWORD);

test.describe("PocketSense auth", () => {
  test("login page loads", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByRole("heading", { name: /log in to pocketsense/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
  });

  test("signup page loads", async ({ page }) => {
    await page.goto("/auth/signup");
    await expect(page).toHaveURL(/\/auth\/signup/);
    await expect(page.getByRole("heading", { name: /create your free pocketsense account/i })).toBeVisible();
    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test("login flow with configured test credentials", async ({ page }) => {
    test.skip(!hasAuthEnv, "Set E2E_EMAIL and E2E_PASSWORD to run authenticated login checks.");

    await page.goto("/auth/login");
    await page.getByLabel(/email/i).fill(process.env.E2E_EMAIL || "");
    await page.getByLabel(/^password$/i).fill(process.env.E2E_PASSWORD || "");
    await page.getByRole("button", { name: /log in/i }).click();

    await expect(page).toHaveURL(/\/(dashboard|onboarding)/);
  });
});
