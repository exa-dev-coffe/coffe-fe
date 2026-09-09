import { test, expect } from "@playwright/test";

test.describe("Storefront & Navigation Flow", () => {
  test("should load home page and display key sections", async ({ page }) => {
    await page.goto("/");

    // Verify main brand heading or slogan
    await expect(page.getByRole("heading", { name: /Your Seating Table/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Select Table|Change Table/i })).toBeVisible();
  });

  test("should navigate and filter store locations", async ({ page }) => {
    await page.goto("/location");

    await expect(page.getByRole("heading", { name: /Our Store Outlets/i })).toBeVisible();
    await expect(page.getByText("Diskusi Coffee Palmerah Flagship")).toBeVisible();

    // Filter by city
    await page.click('button:has-text("Jakarta Selatan")');
    await expect(page.getByText("Diskusi Coffee Senopati Roastery")).toBeVisible();
    await expect(page.getByText("Diskusi Coffee Palmerah Flagship")).not.toBeVisible();

    // Reset filter back to All
    await page.click('button:has-text("All")');
    await expect(page.getByText("Diskusi Coffee Palmerah Flagship")).toBeVisible();
  });

  test("should browse menu page, search items and filter categories", async ({ page }) => {
    await page.goto("/menu");

    await expect(page.getByRole("heading", { name: /Crafted to Perfection/i })).toBeVisible();
    
    // Search for coffee items
    const searchInput = page.locator('input[placeholder*="Search our artisan"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill("Latte");
    await page.waitForTimeout(600); // Allow debounce

    // Clear search
    await searchInput.fill("");
    await page.waitForTimeout(600);

    // Filter categories
    await expect(page.getByRole("button", { name: "All Categories" })).toBeVisible();
  });
});
