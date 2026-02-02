# Cypress Testing References

Official documentation and resources for Cypress, the fast, easy, and reliable E2E testing framework for anything that runs in a browser.

## Official Resources

### Cypress Documentation
- **Official Website**: https://www.cypress.io/
- **GitHub**: https://github.com/cypress-io/cypress
- **Documentation**: https://docs.cypress.io/
- **API Reference**: https://docs.cypress.io/api/table-of-contents/

## Installation

```bash
npm install -D cypress
npx cypress open
```

## Configuration

### cypress.config.ts

```typescript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    excludeSpecPattern: '**/*.cy.{js,jsx,ts,tsx}.snap',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
  },
});
```

## Core Commands

### cy.visit

```javascript
cy.visit('/login');
cy.visit('https://example.com');
cy.visit('index.html', { timeout: 10000 });
```

### cy.get

```javascript
cy.get('.button');
cy.get('#user-name');
cy.get('[data-cy="submit"]');
```

### Type & Click

```javascript
cy.get('input[name="email"]').type('user@example.com');
cy.get('button[type="submit"]').click();
cy.contains('Submit').click();
```

### Assertions

```javascript
cy.get('.message').should('be.visible');
cy.get('.button').should('be.disabled');
cy.get('.title').should('contain', 'Welcome');
cy.url().should('include', '/dashboard');
```

## Custom Commands

### Define Commands

```javascript
// cypress/support/commands.ts
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      getByDataTestId(id: string): Chainable<JQuery<HTMLElement>;
    }
  }
}

Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('getByDataTestId', (selector) => {
  return cy.get(`[data-testid="${selector}"]`);
});
```

### Usage

```javascript
cy.login('user@example.com', 'password123');
cy.getByDataTestId('submit-button').click();
```

## Network Control

### cy.intercept

```javascript
cy.intercept('GET', '/api/users', { fixture: 'users.json' });
cy.visit('/users');

cy.wait('@getUsers');
cy.get('.user').should('have.length', 3);
```

### Stubbing

```javascript
cy.stub(cy, 'request').resolves({ status: 200, body: [] });

cy.visit('/users');
cy.get('.empty-state').should('be.visible');
```

## Fixtures

### Define Fixtures

```javascript
// cypress/fixtures/users.json
[
  {
    "id": 1,
    "name": "User 1",
    "email": "user1@example.com"
  },
  {
    "id": 2,
    "name": "User 2",
    "email": "user2@example.com"
  }
]
```

### Load Fixtures

```javascript
cy.fixture('users.json').as('users');
cy.get('@users').then((users) => {
  cy.request('POST', '/api/users/bulk', { users });
});
```

## Best Practices

### Selectors

```javascript
// Good: data-testid
cy.get('[data-cy="submit"]')

// Good: by ID
cy.get('#submit-button')

// Good: by text
cy.contains('Submit')

// Avoid: CSS selectors
cy.get('.container > div > button')
```

### Chaining

```javascript
cy.get('.user')
  .should('be.visible')
  .and('have.class', 'active')
  .find('.name')
  .should('contain', 'John');
```

### Aliases

```javascript
cy.get('.primary-button').as('button');
cy.get('@button').click();
```

## Testing

### Unit Tests

```javascript
describe('Math utils', () => {
  it('adds numbers', () => {
    expect(add(2, 3)).to.equal(5);
  });
});
```

### Integration Tests

```javascript
describe('User API', () => {
  it('creates user', () => {
    const user = { name: 'Test', email: 'test@example.com' };

    cy.request('POST', '/api/users', user).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('id');
    });
  });
});
```

### E2E Tests

```javascript
describe('User Flow', () => {
  it('completes user journey', () => {
    cy.visit('/');
    cy.contains('Login').click();
    cy.login('user@example.com', 'password');
    cy.contains('Dashboard').should('be.visible');
    cy.contains('Logout').click();
    cy.url().should('include', '/');
  });
});
```

## Hooks

```javascript
describe('Hooks', () => {
  beforeEach(() => {
    // Runs before each test
    cy.visit('/login');
  });

  afterEach(() => {
    // Runs after each test
    cy.clearCookies();
  });

  before(() => {
    // Runs once before all tests
    cy.exec('npm run db:seed');
  });

  after(() => {
    // Runs once after all tests
    cy.exec('npm run db:cleanup');
  });
});
```

## Debugging

### Test Runner UI

```bash
npx cypress open
```

### Headed Mode

```bash
npx cypress run --headed
```

### Debug Mode

```javascript
cy.pause(); // Pause execution
cy.debug(); // Open DevTools
```

### Timeouts

```javascript
// Default timeout: 4000ms
cy.get('.slow-element', { timeout: 10000 });

// Change default timeout
cypress.config.json
{
  "defaultCommandTimeout": 10000
}
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Cypress Tests
on: [push, pull_request]

jobs:
  cypress:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npx cypress run
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: cypress-screenshots
          path: cypress/screenshots
          retention-days: 7
```

## Resources

- **Cypress Docs**: https://docs.cypress.io/
- **API Reference**: https://docs.cypress.io/api/table-of-contents/
- **Best Practices**: https://docs.cypress.io/guides/references/best-practices
- **Migration Guide**: https://docs.cypress.io/guides/references/migration
- **Examples**: https://docs.cypress.io/guides/core-concepts/introduction-to-cypress
