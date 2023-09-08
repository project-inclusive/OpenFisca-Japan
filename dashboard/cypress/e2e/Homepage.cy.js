/// <reference types="cypress" />
describe('Loads homepage', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('Renders main title', () => {
    cy.contains('支援みつもりヤドカリくん');
  })

  it('Renders かんたん計算 button', () => {
    cy.contains('かんたん計算');
  })

  it('Renders くわしく計算 button', () => {
    cy.contains('くわしく計算');
  })
})
