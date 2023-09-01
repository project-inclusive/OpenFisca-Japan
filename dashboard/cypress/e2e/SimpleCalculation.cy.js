/// <reference types="cypress" />
describe('Renders main page and ', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('navigates to simple calculate page, fill in mandatory fields', () => {
    cy.contains('お金サポート ヤドカリくん');
    cy.contains('かんたん計算');
    cy.get('.css-s00sbd').contains("かんたん計算").click();
    cy.url().should('include', '/calculate-simple');
    cy.contains('あなたについて');

    cy.get('[data-testid="select-prefecture"]').select("東京都");
    cy.get('[data-testid="select-city"]').select("渋谷区");
    cy.get('[data-testid="income-input"]').type("150");
  })
})
