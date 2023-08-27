/// <reference types="cypress" />
describe('Loads homepage', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('Renders main page and navigates to simple calculate page', () => {
    cy.contains('お金サポート ヤドカリくん');
    cy.contains('かんたん計算');
    cy.get('.css-s00sbd').click();
    cy.url().should('include', '/calculate-simple');
    cy.contains('あなたについて');
  })
})
