import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers/testData";

test.describe("Admin Dashboard & Management Suite", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("should display main admin dashboard overview", async ({ page }) => {
    await page.goto("/dashboard/menu");
    await expect(page).toHaveURL(/\/dashboard\/menu/);
  });

  test("should view catalog management page and navigate to add catalog", async ({ page }) => {
    await page.goto("/dashboard/manage-catalog");
    await expect(page).toHaveURL(/\/dashboard\/manage-catalog/);

    const addProductLink = page.getByRole("link", { name: /Add Product/i });
    await expect(addProductLink).toBeVisible();
    await addProductLink.click();
    await expect(page).toHaveURL(/\/dashboard\/manage-catalog\/add-catalog/);

    await expect(page.getByRole("heading", { name: "Add New Catalog Item" })).toBeVisible();
  });

  test("should view category management suite", async ({ page }) => {
    await page.goto("/dashboard/manage-category/list-category");
    await expect(page).toHaveURL(/\/dashboard\/manage-category\/list-category/);
  });

  test("should view barista staff management", async ({ page }) => {
    await page.goto("/dashboard/manage-barista");
    await expect(page).toHaveURL(/\/dashboard\/manage-barista/);

    await expect(page.getByRole("button", { name: /Register Barista/i })).toBeVisible();
  });

  test("should view seating table management", async ({ page }) => {
    await page.goto("/dashboard/manage-table");
    await expect(page).toHaveURL(/\/dashboard\/manage-table/);

    await expect(page.getByRole("button", { name: /Add Table/i })).toBeVisible();
  });

  test("should view voucher management page", async ({ page }) => {
    await page.goto("/dashboard/manage-voucher");
    await expect(page).toHaveURL(/\/dashboard\/manage-voucher/);

    await expect(page.getByRole("button", { name: /Add Voucher/i })).toBeVisible();
  });

  test("should view role and permission matrix management page", async ({ page }) => {
    await page.goto("/dashboard/manage-roles");
    await expect(page).toHaveURL(/\/dashboard\/manage-roles/);

    await expect(page.getByRole("heading", { name: "Role & Permission Matrix" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Create New Role/i })).toBeVisible();
  });
});
