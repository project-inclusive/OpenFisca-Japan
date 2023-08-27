/// <reference types="cypress" />
describe('Loads homepage', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('Renders main page and navigates to detailed calculate page', () => {
    cy.contains('お金サポート ヤドカリくん');
    cy.contains('くわしく計算');
    cy.get('.css-1icvf0w').click();
    cy.url().should('include', '/calculate');
    cy.contains('あなたについて');
    cy.contains('くわしく計算');
  })
})
