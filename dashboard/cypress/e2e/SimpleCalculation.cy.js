/// <reference types="cypress" />
describe('Renders main page and ', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('navigates to simple calculate page, fill in mandatory fields', () => {
    cy.contains('支援みつもりヤドカリくん');
    cy.contains('かんたん見積もり');
    cy.get('.css-s00sbd').contains('かんたん見積もり').click();

    cy.contains('利用規約に同意します。');
    cy.get('.css-hrbmuv').contains('利用規約に同意します。').click();
    cy.contains('利用開始する');
    cy.get('.css-uwksks').contains('利用開始する').click();

    cy.url().should('include', '/calculate-simple');
    cy.contains('あなたについて');

    cy.get('[data-testid="select-prefecture"]').select('東京都');
    cy.get('[data-testid="select-city"]').select('渋谷区');
    cy.get('[data-testid="income-input"]').type('150');
  });
});
