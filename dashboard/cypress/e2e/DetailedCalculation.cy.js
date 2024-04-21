/// <reference types="cypress" />
describe('Renders main page and ', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('navigates to detailed calculate page', () => {
    cy.contains('支援みつもりヤドカリくん');
    cy.contains('くわしく見積もり');

    cy.get('[data-testid="calculate-detail-button"]')
      .contains('くわしく見積もり')
      .click();

    cy.contains('利用規約に同意します。');
    cy.get('[data-testid="terms-checkbox"]')
      .contains('利用規約に同意します。')
      .click();

    cy.contains('利用開始する');
    cy.get('[data-testid="start-button"]').contains('利用開始する').click();

    cy.url().should('include', '/calculate');
    cy.contains('あなたについて');
    cy.contains('くわしく見積もり');
  });
});
