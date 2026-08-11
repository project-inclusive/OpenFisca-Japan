/// <reference types="cypress" />
describe('Loads homepage', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Renders main title', () => {
    cy.contains('受けられそうな支援をかんたん見積もり');
  });

  it('Renders かんたん見積もり button', () => {
    cy.contains('かんたん見積もり');
  });

  it('Renders くわしく見積もり button', () => {
    cy.contains('くわしく見積もり');
  });

  it('navigates directly to the referral letter flow', () => {
    cy.get('[data-testid="referral-letter-button"]').contains('紹介状').click();

    cy.url().should('include', '/referral-letter');
    cy.get('[data-testid="restrictions-checkbox"]').should('not.exist');
  });
});
