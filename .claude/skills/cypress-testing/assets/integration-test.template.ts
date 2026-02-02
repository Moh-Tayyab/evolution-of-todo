describe('{{TEST_NAME}} Integration', () => {
  it('should integrate with API', () => {
    cy.intercept('GET', '/api/data', { fixture: 'data.json' }).as('getData');
    cy.visit('/');
    cy.wait('@getData');
    cy.get('[data-testid="{{TEST_NAME}}"]').should('contain', 'loaded data');
  });

  it('should handle API errors', () => {
    cy.intercept('GET', '/api/data', { statusCode: 500 }).as('getError');
    cy.visit('/');
    cy.wait('@getError');
    cy.get('.error-message').should('be.visible');
  });

  it('should complete full user flow', () => {
    cy.visit('/');
    cy.get('[data-testid="{{TEST_NAME}}"]').click();
    cy.url().should('include', '/success');
  });
});
