/// <reference types="cypress" />
describe('Renders main page and ', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('navigates to detailed calculate page', () => {
    cy.contains('支援みつもりヤドカリくん');
    cy.contains('くわしく計算');
    cy.get('.css-1icvf0w').contains('くわしく計算').click();
    cy.url().should('include', '/calculate');
    cy.contains('あなたについて');
    cy.contains('くわしく計算');
  });
});
