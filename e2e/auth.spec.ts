import { test, expect } from "@playwright/test";

const hasAuthEnv = Boolean(process.env.E2E_PHONE && process.env.E2E_OTP);

test.describe("PocketSense auth flow", () => {
  test.skip(!hasAuthEnv, "Set E2E_PHONE and E2E_OTP to run real auth/onboarding checks.");

  test("login flow", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByRole("textbox").fill(process.env.E2E_PHONE || "");
    await page.getByRole("button", { name: /otp|code|send/i }).click();
    await page.waitForURL(/\/auth\/verify/);
    await page.getByRole("textbox").first().fill(process.env.E2E_OTP || "");
    await expect(page).toHaveURL(/\/(dashboard|onboarding)/);
  });

  test("onboarding flow", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page.locator("body")).toContainText(/PocketSense|টাকা|Get Started/i);
    await page.getByRole("button", { name: /get started|শুরু/i }).click();
    await expect(page.locator("body")).toContainText(/Name|University|Semester|Allowance/i);
  });
});
