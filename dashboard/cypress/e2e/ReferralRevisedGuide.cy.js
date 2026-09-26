/// <reference types="cypress" />
import { getReferralAreaConfig } from '../../src/components/referral-letter/config';
import {
  createInitialReferralState,
  REFERRAL_STORAGE_KEY,
} from '../../src/components/referral-letter/state';

const cases = [
  {
    name: 'one-no-link',
    area: 'elderly',
    question: 0,
    answer: 0,
    urls: [false],
  },
  { name: 'one-link', area: 'elderly', question: 0, answer: 1, urls: [true] },
  {
    name: 'two-mixed',
    area: 'elderly',
    question: 2,
    answer: 0,
    urls: [false, true],
  },
  {
    name: 'two-mixed-reversed',
    area: 'elderly',
    question: 3,
    answer: 1,
    urls: [true, false],
  },
  {
    name: 'two-links',
    area: 'young-adult',
    question: 1,
    answer: 0,
    urls: [true, true],
  },
];

describe('Revised referral guide output patterns', () => {
  for (const width of [402, 1280])
    for (const scenario of cases) {
      it(`${scenario.name} at ${width}px`, () => {
        const area = getReferralAreaConfig(scenario.area);
        const question = area.questions[scenario.question];
        const answer = question.answers[scenario.answer];
        const answers = Object.fromEntries(
          area.questions.map((q) => [
            q.id,
            q.answers.find((a) => a.urgency === 'none').id,
          ])
        );
        answers[question.id] = answer.id;
        const state = {
          ...createInitialReferralState(),
          noticeAccepted: true,
          areaId: area.id,
          answers,
          mainConcernId: question.id,
          step: { kind: 'result' },
        };
        cy.viewport(width, 900);
        cy.visit('/referral-letter', {
          onBeforeLoad(win) {
            win.sessionStorage.setItem(
              REFERRAL_STORAGE_KEY,
              JSON.stringify(state)
            );
          },
        });
        cy.get('[data-testid="referral-destination"]')
          .should('have.length', scenario.urls.length)
          .each((element, index) => {
            const destination = answer.destinations[index];
            cy.wrap(element).should(
              'contain',
              `相談先${scenario.urls.length > 1 ? ['①', '②'][index] : ''}：${
                destination.name
              }`
            );
            if (scenario.urls[index]) {
              cy.wrap(element)
                .find('a')
                .should('have.attr', 'href', destination.url)
                .and('have.attr', 'target', '_blank');
              cy.wrap(element).should('contain', destination.url);
            } else {
              cy.wrap(element)
                .should('contain', '案内ページのリンクなし')
                .find('a')
                .should('not.exist');
            }
          });
        cy.get('[data-testid="referral-guide"] ol li')
          .should('have.length', scenario.urls.length)
          .each((element, index) => {
            cy.wrap(element).should(
              'contain',
              scenario.urls[index]
                ? '案内ページを開き'
                : 'お住まいの市町村名 電話番号'
            );
          });
        cy.get('[data-testid="referral-guide"]')
          .should('contain', '連絡先が見つかった場合')
          .and('contain', '☆当説明書は相談を保証するものではありません。');
        cy.get('[data-testid="referral-letter"]')
          .should('not.contain', '相談先')
          .and('not.contain', '緊急度')
          .and('not.contain', 'メールアドレス')
          .and(
            'contain',
            '☆当紹介状は相談・支援を強制するものではありません。'
          );
        cy.get('.referral-print-cutline').should('not.be.visible');
        cy.document().then((doc) =>
          expect(doc.documentElement.scrollWidth).to.be.at.most(
            doc.documentElement.clientWidth
          )
        );
        cy.injectAxe();
        cy.checkA11y('main', {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
        });
        cy.screenshot(`revised-${scenario.name}-${width}`, {
          capture: 'fullPage',
        });
        if (scenario.name === 'two-links' && width === 402) {
          cy.window().then((win) => {
            cy.stub(win.HTMLAnchorElement.prototype, 'click').callsFake(
              function () {
                win.__revisedPng = this.href.split(',')[1];
              }
            );
          });
          cy.contains('button', 'スクリーンショットで保存').click();
          cy.window()
            .its('__revisedPng', { timeout: 30000 })
            .should('be.a', 'string')
            .then((bytes) =>
              cy.writeFile(
                'cypress/screenshots/revised-long-urls-export.png',
                bytes,
                'base64'
              )
            );
        }
      });
    }
});
