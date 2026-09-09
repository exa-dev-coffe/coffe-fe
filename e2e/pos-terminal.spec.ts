import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers/testData";

test.describe("POS Terminal Feature E2E Flow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("Should navigate to POS Terminal, add items to cart, and process Cash payment with receipt", async ({ page }) => {
    // Navigate to POS Terminal
    await page.goto("/pos-terminal");
    await expect(page.locator("h1")).toContainText("POS Terminal");

    // Clear cart if any existing items
    const clearButton = page.locator('button:has-text("Clear")');
    if (await clearButton.isVisible()) {
      await clearButton.click();
    }

    // Add first menu item to cart
    const addFirstMenuBtn = page.locator("button:has-text('Add to Cart')").first();
    await expect(addFirstMenuBtn).toBeVisible({ timeout: 10000 });
    await addFirstMenuBtn.click();

    // Verify cart count badge
    await expect(page.locator("text=/\\d+ Items/i")).toBeVisible();

    // Fill customer name
    const customerInput = page.locator('input[placeholder*="Guest"]');
    await customerInput.fill("E2E Cash Customer");

    // Open Payment Modal
    const proceedButton = page.locator('button:has-text("Proceed to Payment")');
    await expect(proceedButton).toBeEnabled();
    await proceedButton.click();

    // Payment modal should open
    await expect(page.locator("text=Select Payment Method")).toBeVisible();

    // Select Cash Payment Preset
    const exactAmountBtn = page.locator('button:has-text("Exact Amount")');
    await expect(exactAmountBtn).toBeVisible();
    await exactAmountBtn.click();

    // Submit Cash Payment
    const completePaymentBtn = page.locator('button:has-text("Complete Cash Order")');
    await expect(completePaymentBtn).toBeEnabled();
    await completePaymentBtn.click();

    // Verify Receipt Modal opens
    await expect(page.locator("text=Official Receipt")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=E2E Cash Customer")).toBeVisible();

    // Close Receipt Modal
    const newOrderBtn = page.locator('button:has-text("New Order")');
    await newOrderBtn.click();
  });

  test("Should generate Midtrans QRIS code modal and show in POS History", async ({ page }) => {
    await page.goto("/pos-terminal");

    // Add item to cart
    const addFirstMenuBtn = page.locator("button:has-text('Add to Cart')").first();
    await expect(addFirstMenuBtn).toBeVisible({ timeout: 10000 });
    await addFirstMenuBtn.click();

    // Fill customer name
    const customerInput = page.locator('input[placeholder*="Guest"]');
    await customerInput.fill("E2E QRIS Customer");

    // Open Payment Modal
    await page.click('button:has-text("Proceed to Payment")');

    // Select QRIS / Midtrans tab
    const qrisTab = page.locator('button:has-text("Midtrans QRIS")');
    await qrisTab.click();

    // Confirm QRIS Generation
    const generateQrisBtn = page.locator('button:has-text("Generate QRIS Code")');
    await expect(generateQrisBtn).toBeEnabled();
    await generateQrisBtn.click();

    // Verify Dedicated QRIS Modal opens
    await expect(page.locator("text=Midtrans QRIS Payment")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Waiting for customer payment...")).toBeVisible();

    // Close QRIS Modal to keep in history
    await page.click('button:has-text("Close")');

    // Open POS History Modal
    await page.click('button:has-text("History")');

    // Verify POS History modal opens with pagination
    await expect(page.locator("text=POS Transaction History")).toBeVisible();
    await expect(page.locator("text=Pending QRIS")).toBeVisible();

    // Filter by Pending QRIS tab
    await page.click('button:has-text("Pending QRIS")');
    await expect(page.locator("text=#POS-")).toBeVisible();

    // Close History Modal
    await page.click('button:has-text("Close")');
  });

  test("Should allow switching payment method from Pending QRIS to Cash via POS History", async ({ page }) => {
    await page.goto("/pos-terminal");

    // Open POS History
    await page.click('button:has-text("History")');
    await expect(page.locator("text=POS Transaction History")).toBeVisible();

    // Filter Pending QRIS orders
    await page.click('button:has-text("Pending QRIS")');

    // If a pending order exists, switch payment to Cash
    const changeMethodBtn = page.locator('button:has-text("Change Method")').first();
    if (await changeMethodBtn.isVisible()) {
      await changeMethodBtn.click();

      // Change Payment Modal opens
      await expect(page.locator("text=Change Payment Method")).toBeVisible();

      // Select Cash Payment
      await page.click('button:has-text("Cash Payment")');
      await page.click('button:has-text("Exact Amount")');

      // Submit Cash Payment Change
      await page.click('button:has-text("Complete Cash Order")');

      // Receipt modal should be displayed
      await expect(page.locator("text=Official Receipt")).toBeVisible({ timeout: 10000 });
      await page.click('button:has-text("Close")');
    } else {
      // Close history if no pending order
      await page.click('button:has-text("Close")');
    }
  });
});
