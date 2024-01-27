/// <reference types="cypress" />
describe('Loads homepage', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Renders main title', () => {
    cy.contains('支援みつもりヤドカリくん');
  });

  it('Renders はじめる button', () => {
    cy.contains('はじめる');
  });
});
