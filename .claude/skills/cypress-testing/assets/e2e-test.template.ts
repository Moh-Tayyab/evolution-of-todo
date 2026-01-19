describe('{{TEST_NAME}}', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load successfully', () => {
    cy.title().should('include', '{{TEST_NAME}}');
  });

  it('should perform user action', () => {
    cy.get('[data-testid="{{TEST_NAME}}"]').click();
    cy.url().should('include', '/success');
  });

  it('should handle error states', () => {
    cy.get('[data-testid="{{TEST_NAME}}"]').click();
    cy.get('.error').should('be.visible');
  });
});
