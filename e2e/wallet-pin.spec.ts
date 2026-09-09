import { test, expect } from "@playwright/test";

test.describe("Wallet PIN Settings & Reset Flow", () => {
  test.beforeEach(async ({ context, page }) => {
    // Add auth cookie
    await context.addCookies([
      {
        name: "token",
        value: "mock-customer-token",
        domain: "localhost",
        path: "/",
      },
    ]);

    // Mock Profile API
    await page.route("**/api/1.0/me*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Profile retrieved",
          data: {
            userId: 100,
            fullName: "Test Customer",
            email: "customer@example.com",
            role: "user",
            roleId: 2,
          },
        }),
      });
    });

    // Mock Balance API
    await page.route("**/api/1.0/balance*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Balance retrieved",
          data: { isActive: true, balance: 150000, walletNumber: "883900000100" },
        }),
      });
    });
  });

  test("should open PIN Settings modal from member wallet page", async ({ page }) => {
    await page.goto("/my-wallet");
    await expect(page).toHaveURL(/\/my-wallet/);

    const pinSettingsButton = page.getByRole("button", { name: "PIN", exact: true });
    await expect(pinSettingsButton).toBeVisible();
    await pinSettingsButton.click();

    // Verify modal title
    await expect(page.getByText("Transaction PIN Settings")).toBeVisible();
  });

  test("should toggle between Change PIN and Forgot PIN (Email OTP) tabs", async ({ page }) => {
    await page.goto("/my-wallet");
    const pinSettingsButton = page.getByRole("button", { name: "PIN", exact: true });
    await pinSettingsButton.click();

    // Verify default tab is Change PIN
    await expect(page.getByRole("button", { name: "Change PIN" }).first()).toBeVisible();

    // Click Forgot PIN tab
    const forgotTab = page.getByRole("button", { name: /Forgot PIN/i });
    await forgotTab.click();

    // Verify OTP email reset elements
    await expect(page.getByText("Reset PIN via Verification Code")).toBeVisible();
  });
});
