/// <reference types="cypress" />
describe('Renders main page and ', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('navigates to simple calculate page, fill in mandatory fields', () => {
    cy.contains('支援みつもりヤドカリくん');
    cy.contains('かんたん見積もり');
    cy.get('[data-testid="calculate-simple-button"]')
      .contains('かんたん見積もり')
      .click();

    cy.contains('利用規約に同意します。');
    cy.get('[data-testid="terms-checkbox"]')
      .contains('利用規約に同意します。')
      .click();

    cy.contains('利用開始する');
    cy.get('[data-testid="start-button"]').contains('利用開始する').click();

    cy.url().should('include', '/calculate-simple');
    cy.contains('あなたについて');

    cy.get('[data-testid="select-prefecture"]').select('東京都');
    cy.get('[data-testid="select-city"]').select('渋谷区');
    cy.get('[data-testid="income-input"]').type('150');
  });
});
