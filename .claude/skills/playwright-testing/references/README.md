# Playwright Testing References

Official documentation and resources for Playwright, Microsoft's end-to-end testing framework.

## Official Resources

### Playwright Documentation
- **Official Website**: https://playwright.dev/
- **GitHub**: https://github.com/microsoft/playwright
- **Documentation**: https://playwright.dev/docs/intro/
- **API Reference**: https://playwright.dev/docs/api/class-playwright

## Installation

```bash
npm install -D @playwright/test
npx playwright install
```

## Quick Start

### Create First Test
```typescript
import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  await page.goto('https://playwright.dev');
  await expect(page).toHaveTitle(/Playwright/);
});
```

### Run Tests
```bash
npx playwright test
```

## Core Concepts

### Browser Context
```typescript
import { test } from '@playwright/test';

test('browser context', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://example.com');
});
```

### Locators
```typescript
// By CSS selector
page.locator('.button')

// By text
page.getByText('Click me')

// By role
page.getByRole('button', { name: 'Submit' })

// By test ID
page.getByTestId('submit-btn')

// By label
page.getByLabel('Username')
```

### Actions

```typescript
// Click
await page.click('.button');

// Type
await page.fill('#username', 'user');

// Select
await page.selectOption('#country', 'US');

// Upload
await page.setInputFiles('input[type="file"]', 'file.txt');

// Hover
await page.hover('.element');

// Screenshot
await page.screenshot({ path: 'screenshot.png' });
```

## Page Object Model

```typescript
// pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }

  async getErrorMessage() {
    return await this.page.locator('.error').textContent();
  }
}

// Usage
import { test } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test('user login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password');
  await expect(page).toHaveURL('/dashboard');
});
```

## API Testing

```typescript
import { test, expect } from '@playwright/test';

test('API request', async ({ request }) => {
  const response = await request.get('https://api.example.com/users');
  expect(response.status()).toBe(200);

  const users = await response.json();
  expect(users).toBeInstanceOf(Array);
});
```

## Network Mocking

```typescript
test('mock API', async ({ page }) => {
  await page.route('**/api/data', route => route.fulfill({
    status: 200,
    body: JSON.stringify({ data: 'test' }),
  }));

  await page.goto('/page');
});
```

## Visual Regression

```typescript
test('visual regression', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveScreenshot('homepage');

  // Compare with baseline
  await expect(page).toHaveScreenshot('homepage-full', {
    fullPage: true,
  });
});
```

## Accessibility

```typescript
test('accessibility', async ({ page }) => {
  await page.goto('/');

  // Run accessibility scan
  const accessibilityScanResults = await page.accessibility.scan();

  expect(accessibilityScanResults).toHaveNoAccessibilityIssues();
});
```

## Configuration

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```

## Best Practices

### Selectors
```typescript
// Good: data-testid
page.getByTestId('submit-button')

// Good: accessible role
page.getByRole('button', { name: 'Submit' })

// Avoid: complex CSS
page.locator('.container > div:nth-child(2) > button')
```

### Waiting
```typescript
// Wait for element
await page.waitForSelector('.button');

// Wait for URL
await page.waitForURL('/dashboard');

// Wait for network
await page.waitForResponse('**/api/data');

// Wait for load state
await page.waitForLoadState('networkidle');
```

### Assertions
```typescript
// URL assertion
await expect(page).toHaveURL('/dashboard');

// Text assertion
await expect(page.getByText('Welcome')).toBeVisible();

// Element count
await expect(page.locator('.item')).toHaveCount(3);

// Attribute assertion
await expect(page.getByRole('button')).toHaveAttribute('disabled');
```

## Debugging

### Playwright Inspector
```bash
npx playwright codegen https://example.com
```

### Trace Viewer
```typescript
test('debug test', async ({ page }) => {
  // Trace the test
  await page.context().tracing.start({ screenshots: true, snapshots: true });

  // Your test code

  // Stop tracing
  await page.context().tracing.stop({ path: 'trace.zip' });
});
```

### Headed vs Headless
```typescript
// Run headed (show browser)
npx playwright test --headed

// Run in headless mode (default)
npx playwright test
```

## CI/CD Integration

### GitHub Actions
```yaml
name: Playwright Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Resources

- **Playwright Docs**: https://playwright.dev/docs/intro/
- **API Reference**: https://playwright.dev/docs/api/class-playwright/
- **Best Practices**: https://playwright.dev/docs/best-practices
- **Examples**: https://playwright.dev/docs/codecs-intro
