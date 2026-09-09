import { test, expect } from "@playwright/test";

test.describe("Admin Wallet Management E2E Flow", () => {
  test.beforeEach(async ({ context, page }) => {
    // Add auth cookie
    await context.addCookies([
      {
        name: "token",
        value: "mock-admin-token",
        domain: "localhost",
        path: "/",
      },
    ]);

    // Mock Profile API (/api/1.0/me)
    await page.route("**/api/1.0/me*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Profile retrieved",
          data: {
            userId: 1,
            fullName: "Super Admin",
            email: "admin@gmail.com",
            role: "Super Admin",
            roleId: 1,
            permissions: {
              wallet_management: { view: true, create: true, edit: true, delete: true },
            },
          },
        }),
      });
    });

    // Mock Admin Wallets API
    await page.route("**/api/1.0/admin/wallets?*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Wallets retrieved",
          data: {
            data: [
              {
                id: 1,
                userId: 100,
                walletNumber: "883900000100",
                balance: 250000,
                isActive: true,
              },
              {
                id: 2,
                userId: 200,
                walletNumber: "883900000200",
                balance: 0,
                isActive: false,
              },
            ],
            page: 1,
            pageSize: 10,
            totalData: 2,
            totalPages: 1,
          },
        }),
      });
    });

    // Mock Summary API
    await page.route("**/api/1.0/admin/wallets/summary", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            totalActiveWallets: 1,
            totalInactiveWallets: 1,
            totalOutstandingBalance: 250000,
          },
        }),
      });
    });
  });

  test("should render Admin Wallet summary cards and table correctly", async ({ page }) => {
    await page.goto("/dashboard/manage-wallets");
    await expect(page).toHaveURL(/\/dashboard\/manage-wallets/);

    // Verify Page Header
    await expect(page.getByText("Customer Wallet Management")).toBeVisible();

    // Verify Summary Cards
    await expect(page.getByText("Active Member Wallets")).toBeVisible();
    await expect(page.getByText("Unactivated / Suspended")).toBeVisible();
    await expect(page.getByText("Total Outstanding Balance")).toBeVisible();

    // Verify Table Rows with Bank-style Wallet Account Numbers
    await expect(page.getByText("8839 0000 0100")).toBeVisible();
    await expect(page.getByText("8839 0000 0200")).toBeVisible();
  });

  test("should open and close Mutasi transaction history modal", async ({ page }) => {
    // Mock History API
    await page.route("**/api/1.0/admin/wallets/100/history?*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: {
            data: [
              {
                id: "tx-1",
                amount: 50000,
                type: "topup",
                description: "Midtrans Top Up",
                createdAt: "2026-08-25T10:00:00Z",
                status: "success",
              },
            ],
            page: 1,
            pageSize: 5,
            totalData: 1,
            totalPages: 1,
          },
        }),
      });
    });

    await page.goto("/dashboard/manage-wallets");

    const mutasiButton = page.locator("tr", { hasText: "8839 0000 0100" }).getByRole("button", { name: /Mutasi/i });
    await mutasiButton.click();

    // Verify Modal Header & Content
    await expect(page.getByText(/Wallet Transaction History/i)).toBeVisible();
    await expect(page.getByText("Midtrans Top Up")).toBeVisible();

    // Close Modal using exact button name
    await page.getByRole("button", { name: "Close", exact: true }).click();
    await expect(page.getByText(/Wallet Transaction History/i)).not.toBeVisible();
  });

  test("should open Reset PIN modal and send email verification code", async ({ page }) => {
    // Mock Send Code API
    await page.route("**/api/1.0/admin/wallets/reset-pin/send-code", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Verification code sent to email",
        }),
      });
    });

    await page.goto("/dashboard/manage-wallets");

    const resetPinButton = page.locator("tr", { hasText: "8839 0000 0100" }).getByRole("button", { name: /Reset PIN/i });
    await resetPinButton.click();

    // Verify Modal
    await expect(page.getByText("Reset Customer Wallet PIN")).toBeVisible();

    // Input Customer Email & Click Send Code
    await page.fill('input[type="email"]', "customer@example.com");
    const sendCodeBtn = page.getByRole("button", { name: /Send Code/i });
    await sendCodeBtn.click();

    // Verification code inputs should become visible
    await expect(page.getByText("Verification Code (6 Digits from Email)")).toBeVisible();
  });

  test("should open Suspend confirmation modal and toggle wallet status", async ({ page }) => {
    // Mock Toggle Status API
    await page.route("**/api/1.0/admin/wallets/100/toggle-status", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          message: "Wallet status updated",
        }),
      });
    });

    await page.goto("/dashboard/manage-wallets");

    const suspendBtn = page.locator("tr", { hasText: "8839 0000 0100" }).getByRole("button", { name: /Suspend/i });
    await suspendBtn.click();

    // Verify Custom ConfirmModal
    await expect(page.getByText("Suspend Customer Wallet")).toBeVisible();
    await expect(page.getByText(/Are you sure you want to suspend wallet/i)).toBeVisible();

    // Confirm Action
    const confirmBtn = page.getByRole("button", { name: "Suspend Wallet" });
    await confirmBtn.click();

    // Modal should close
    await expect(page.getByText("Suspend Customer Wallet")).not.toBeVisible();
  });
});
