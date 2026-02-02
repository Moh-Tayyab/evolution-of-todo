import { test, expect } from '@playwright/test';

test.describe('{{TEST_NAME}}', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/');
  });

  test('should load successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/{{TEST_NAME}}/);
  });

  test('should perform user action', async ({ page }) => {
    // Add test steps
    await page.click('button');
    await expect(page).toHaveURL(/.*success/);
  });
});
