import { test, expect } from '@playwright/test';

test.describe('{{TEST_NAME}} Visual Regression', () => {
  test('should match screenshot', async ({ page }) => {
    await page.goto('/');

    // Full page screenshot
    await expect(page).toHaveScreenshot('{{TEST_NAME}}-full.png', {
      fullPage: true
    });
  });

  test('should match component screenshot', async ({ page }) => {
    await page.goto('/');

    const element = page.locator('[data-testid="{{TEST_NAME}}"]');
    await expect(element).toHaveScreenshot('{{TEST_NAME}}-component.png');
  });
});
