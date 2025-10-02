/// <reference types="cypress" />
describe('Renders main page and ', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('navigates to simple calculate page, fill in mandatory fields', () => {
    cy.contains('もらえるお金をかんたん見積もり');
    cy.contains('かんたん見積もり');
    cy.get('[data-testid="calculate-simple-button"]')
      .contains('かんたん見積もり')
      .click();

    cy.contains('了解しました');
    cy.get('[data-testid="restrictions-checkbox"]')
      .contains('了解しました')
      .click();

    cy.contains('了解しました');
    cy.get('[data-testid="terms-checkbox"]').contains('了解しました').click();

    cy.contains('利用開始する');
    cy.get('[data-testid="start-button"]').contains('利用開始する').click();

    cy.url().should('include', '/calculate-simple');
    cy.contains('あなたについて');
    cy.contains('かんたん見積もり');
  });
});
