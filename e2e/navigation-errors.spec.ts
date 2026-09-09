import { test, expect } from "@playwright/test";

test.describe("Error Pages & Routing Flow", () => {
  test("should render 404 Not Found page for invalid route", async ({ page }) => {
    await page.goto("/some-non-existent-page-route-xyz");

    await expect(page.getByText("404")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Page Not Found/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Return Home/i })).toBeVisible();
  });

  test("should render 403 Forbidden page on explicit access", async ({ page }) => {
    await page.goto("/403");

    await expect(page.getByText("403")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Access Restricted/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Return to Storefront/i })).toBeVisible();
  });
});
