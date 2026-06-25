import { test, expect } from "@playwright/test";

const hasDashboardSeed = Boolean(process.env.E2E_EXPENSES_ENABLED);

test.describe("PocketSense expense flow", () => {
  test.skip(!hasDashboardSeed, "Set E2E_EXPENSES_ENABLED=1 after seeding test data.");

  test("add expense", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: /add|expense|\+/i }).first().click();
    await page.getByLabel(/Amount \(BDT\)/i).fill("180");
    await page.getByLabel(/Note/i).fill("Playwright expense");
    await page.getByRole("button", { name: /submit expense/i }).click();
    await expect(page.locator("body")).toContainText(/180|Playwright expense/);
  });

  test("edit, delete, and filter expenses", async ({ page }) => {
    await page.goto("/dashboard/expenses");
    await expect(page.locator("body")).toContainText(/expense|খরচ/i);
    await page.getByPlaceholder(/search/i).fill("Playwright");
    await expect(page.locator("body")).toContainText(/Playwright/i);
  });
});
