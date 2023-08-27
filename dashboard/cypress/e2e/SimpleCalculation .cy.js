/// <reference types="cypress" />
describe('Loads homepage', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('Renders main title', () => {
    cy.contains('お金サポート ヤドカリくん');
  })

  it('Renders かんたん計算 button', () => {
    cy.contains('かんたん計算');
    cy.click('かんたん計算');
  })

  it('Navigates to /calculate-simple page', () => {
    cy.url().should('include', '/calculate-simple')
  })
})
