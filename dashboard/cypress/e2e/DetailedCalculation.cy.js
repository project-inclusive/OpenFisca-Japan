/// <reference types="cypress" />
describe('Renders main page and ', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('navigates to detailed calculate page', () => {
    cy.contains('支援みつもりヤドカリくん');
    cy.contains('くわしく見積もり');
    cy.get('.css-1icvf0w').contains('くわしく見積もり').click();

    cy.contains('利用規約に同意します。');
    cy.get('.css-1vf3rrs').contains('利用規約に同意します。').click();
    cy.contains('利用開始する');
    cy.get('.css-p9zb1n').contains('利用開始する').click();

    cy.url().should('include', '/calculate');
    cy.contains('あなたについて');
    cy.contains('くわしく見積もり');
  });
});
