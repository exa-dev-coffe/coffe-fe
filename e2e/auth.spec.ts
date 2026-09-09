import { test, expect } from "@playwright/test";
import { ADMIN_CREDENTIALS } from "./helpers/testData";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies/localStorage to ensure clean state
    await page.context().clearCookies();
  });

  test("should display login page elements correctly", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("heading", { name: /Welcome Back/i }),
    ).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /Sign In/i })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Create an account/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Forgot password\?/i }),
    ).toBeVisible();
  });

  test("should show error on invalid login credentials", async ({ page }) => {
    await page.goto("/login");

    await page.fill('input[name="email"]', "nonexistent_user_999@example.com");
    await page.fill('input[name="password"]', "WrongPassword123!");
    await page.click('button[type="submit"]');

    // Should remain on login page or display error toast/message
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/login/);
  });

  test("should login successfully with valid admin credentials", async ({
    page,
  }) => {
    await page.goto("/login");

    await page.fill('input[name="email"]', ADMIN_CREDENTIALS.email);
    await page.fill('input[name="password"]', ADMIN_CREDENTIALS.password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("should display register page elements", async ({ page }) => {
    await page.goto("/register");

    await expect(
      page.getByRole("heading", { name: /Create Account/i }),
    ).toBeVisible();
    await expect(page.locator('input[name="fullName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Create Account/i }),
    ).toBeVisible();
  });

  test("should validate password match on register page", async ({ page }) => {
    await page.goto("/register");

    await page.fill('input[name="fullName"]', "Test User");
    await page.fill('input[name="email"]', "testmatch@example.com");
    await page.fill('input[name="password"]', "Password123!");
    await page.fill('input[name="confirmPassword"]', "DifferentPassword123!");
    await page.click('button[type="submit"]');

    // Verification code modal should NOT open when passwords don't match
    await expect(page.getByText(/Verify Your Email/i)).not.toBeVisible();
  });

  test("should protect authenticated routes for guests", async ({ page }) => {
    await page.goto("/my-cart");
    // Unauthenticated user accessing protected route should be redirected to login
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
