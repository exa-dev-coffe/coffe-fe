import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers/testData";

test.describe("Wallet & Transaction Flows", () => {
  test("should redirect guest away from wallet pages to login", async ({ page }) => {
    await page.goto("/my-wallet");
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/my-transaction");
    await expect(page).toHaveURL(/\/login/);
  });

  test("should access member wallet dashboard after login", async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto("/my-wallet");
    await expect(page).toHaveURL(/\/my-wallet/);
    await expect(page.getByText("DISKUSI DIGITAL WALLET").first()).toBeVisible();
  });

  test("should display activate wallet setup page elements", async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto("/my-wallet/activate");
    await expect(page.getByRole("heading", { name: "Activate Digital Wallet" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Activate Wallet|Submit/i })).toBeVisible();
  });

  test("should display top-up wallet page elements", async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto("/my-wallet/top-up");
    await expect(page.getByRole("heading", { name: /Top Up Digital Wallet/i })).toBeVisible();
  });

  test("should view my transaction history page", async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto("/my-transaction");
    await expect(page).toHaveURL(/\/my-transaction/);
  });
});
