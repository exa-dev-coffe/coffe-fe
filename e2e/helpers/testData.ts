import { Page, expect } from "@playwright/test";

export const ADMIN_CREDENTIALS = {
  email: "admin@gmail.com",
  password: "admin123",
};

export const BARISTA_CREDENTIALS = {
  email: "barista@gmail.com",
  password: "admin123",
};

export function generateTestUser() {
  const timestamp = Date.now();
  return {
    fullName: `Test Customer ${timestamp}`,
    email: `customer_${timestamp}@test.com`,
    password: "Password123!",
  };
}

export function generateTestBarista() {
  const timestamp = Date.now();
  return {
    fullName: `Test Barista ${timestamp}`,
    email: `barista_${timestamp}@test.com`,
    password: "BaristaPassword123!",
  };
}

export async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.fill('input[name="email"]', ADMIN_CREDENTIALS.email);
  await page.fill('input[name="password"]', ADMIN_CREDENTIALS.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/);
}

export async function loginAsBarista(page: Page) {
  await page.goto("/login");
  await page.fill('input[name="email"]', BARISTA_CREDENTIALS.email);
  await page.fill('input[name="password"]', BARISTA_CREDENTIALS.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/dashboard/);
}
