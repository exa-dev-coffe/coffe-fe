import { test, expect } from "@playwright/test";
import { loginAsBarista } from "./helpers/testData";

test.describe("Barista Management & Inventory Suite", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsBarista(page);
  });

  test("should view order queue dashboard", async ({ page }) => {
    await page.goto("/dashboard/manage-order");
    await expect(page).toHaveURL(/\/dashboard\/manage-order/);

    await expect(page.getByRole("heading", { name: /Incoming Barista Orders/i })).toBeVisible();
    await expect(page.locator('input[placeholder*="Search orders"]')).toBeVisible();
  });

  test("should view inventory availability management page", async ({ page }) => {
    await page.goto("/dashboard/manage-inventory");
    await expect(page).toHaveURL(/\/dashboard\/manage-inventory/);

    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
  });
});
