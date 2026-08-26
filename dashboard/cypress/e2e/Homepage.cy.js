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

  it('floats the beta referral entry at the bottom right on mobile', () => {
    cy.viewport(402, 874);

    cy.get('[data-testid="referral-letter-button"]').then(($button) => {
      const rect = $button[0].getBoundingClientRect();

      expect(rect.right).to.be.greaterThan(370);
      expect(rect.bottom).to.be.greaterThan(840);
      expect(rect.right).to.be.lessThan(402);
      expect(rect.bottom).to.be.lessThan(874);
    });
  });

  it('navigates directly to the referral letter flow', () => {
    cy.get('[data-testid="referral-letter-button"]')
      .should('have.css', 'position', 'fixed')
      .and('contain', '紹介状')
      .and('contain', 'β版')
      .click();

    cy.url().should('include', '/referral-letter');
    cy.get('[data-testid="restrictions-checkbox"]').should('not.exist');
  });
});
