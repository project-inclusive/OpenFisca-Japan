/// <reference types="cypress" />
describe('Loads homepage', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Renders main title', () => {
    cy.contains('支援みつもりヤドカリくん');
  });

  it('Renders かんたん見積もり button', () => {
    cy.contains('かんたん見積もり');
  });

  it('Renders くわしく見積もり button', () => {
    cy.contains('くわしく見積もり');
  });
});
