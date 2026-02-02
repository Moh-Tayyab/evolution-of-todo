# Vitest Expert References

Official documentation and resources for Vitest, the blazing-fast unit test framework powered by Vite.

## Official Resources

### Vitest Documentation
- **Official Website**: https://vitest.dev/
- **GitHub**: https://github.com/vitest-dev/vitest
- **Documentation**: https://vitest.dev/guide/
- **API Reference**: https://vitest.dev/api/

## Installation

```bash
npm install -D vitest
```

## Configuration

### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**',
      ],
      include: ['src/**/*.{js,ts}'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

## Core APIs

### describe
```typescript
import { describe } from 'vitest';

describe('Math operations', () => {
  it('should add numbers', () => {
    expect(add(1, 2)).toBe(3);
  });
});
```

### it / test
```typescript
test('should return true', () => {
  expect(isValid()).toBe(true);
});

test.skip('skipped test', () => {
  // This test is skipped
});

test.only('only this test runs', () => {
  // Only this test runs
});
```

### expect
```typescript
expect(value).toBe(expected);
expect(value).toEqual(expected);
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toContain(item);
expect(value).toHaveLength(length);
expect(value).toThrow(Error);
expect(value).resolvesTo(value);
expect(value).rejects.toThrow();
```

## Mocking with vi

### vi.fn
```typescript
import { vi } from 'vitest';

const mockFn = vi.fn();
mockFn('argument');
expect(mockFn).toHaveBeenCalledWith('argument');

mockFn.mockReturnValue('value');
expect(mockFn()).toBe('value');
```

### vi.mock
```typescript
import { vi } from 'vitest';

vi.mock('./api', () => ({
  fetchUser: vi.fn(() => Promise.resolve({ id: 1 })),
}));

import { fetchUser } from './api';

expect(fetchUser).toHaveBeenCalled();
```

### vi.spyOn
```typescript
import { vi } from 'vitest';
import * as math from './math';

const spy = vi.spyOn(math, 'add');
spy.mockReturnValue(5);

math.add(1, 2); // Returns 5, not 3

expect(spy).toHaveBeenCalledWith(1, 2);
```

## Async Testing

```typescript
import { test, expect } from 'vitest';

test('async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBe('success');
});

test('async error', async () => {
  await expect(asyncFunction()).rejects.toThrow();
});
```

## Component Testing

### with @testing-library/react
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Counter } from './Counter';

describe('Counter', () => {
  it('increments count', async () => {
    const { getByText, getByRole } = render(<Counter />);

    await userEvent.click(getByRole('button', { name: /increment/i }));

    expect(getByText('1')).toBeInTheDocument();
  });
});
```

### with @testing-library/vue
```typescript
import { render } from '@testing-library/vue';
import { describe, it, expect } from 'vitest';

describe('Component', () => {
  it('renders message', () => {
    const { getByText } = render(Component, {
      props: { message: 'Hello' }
    });

    getByText('Hello');
  });
});
```

## Coverage

```bash
# Run tests with coverage
npm run test:coverage

# View coverage report
open coverage/index.html
```

## Best Practices

### Test Organization
```
src/
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx
├── lib/
│   └── math.ts
└── lib.test.ts
```

### Hooks
```typescript
import { beforeEach, afterEach } from 'vitest';

describe('with hooks', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
    vi.clearAllMocks();
  });
});
```

### Snapshot Testing
```typescript
it('matches snapshot', () => {
  const { container } = render(<Component />);
  expect(container).toMatchSnapshot();
});
```

## Watch Mode

```bash
# Watch mode for development
npm run test -- --watch

# UI mode for visual debugging
npm run test -- --ui --coverage
```

## CI/CD Integration

### GitHub Actions
```yaml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
```

## Troubleshooting

### Common Issues

**Issue: Import errors**
- Configure module resolution in vitest.config.ts
- Add alias for @ paths

**Issue: Mock not working**
- Use vi.mock() before import
- Check mock path is correct
- Call vi.clearAllMocks() in beforeEach

**Issue: Timeout**
- Increase test timeout: test.setTimeout(5000)
- Fix async handling
- Check for promise chains

## Resources

- **Vitest Docs**: https://vitest.dev/
- **Guide**: https://vitest.dev/guide/
- **API**: https://vitest.dev/api/
- **Migration from Jest**: https://vitest.dev/guide/migration.html
