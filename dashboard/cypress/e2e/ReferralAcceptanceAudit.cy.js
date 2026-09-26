/// <reference types="cypress" />
import { REFERRAL_AREA_CONFIGS } from '../../src/components/referral-letter/config';
import {
  deriveConcernCandidates,
  isReferralCandidateAnswer,
} from '../../src/components/referral-letter/logic';
import {
  createInitialReferralState,
  REFERRAL_STORAGE_KEY,
} from '../../src/components/referral-letter/state';

const seed = (area, step = { kind: 'result' }) => {
  const answers = Object.fromEntries(
    area.questions.map((q) => [
      q.id,
      q.answers.find(isReferralCandidateAnswer).id,
    ])
  );
  const candidates = deriveConcernCandidates(area.id, answers);
  return {
    ...createInitialReferralState(),
    noticeAccepted: true,
    areaId: area.id,
    answers,
    mainConcernId: candidates[0].id,
    otherConcernIds: candidates.slice(1, 4).map((c) => c.id),
    step,
  };
};
const visitState = (state) => {
  const serialized = JSON.stringify(state);
  return cy.visit('/referral-letter', {
    onBeforeLoad(win) {
      win.sessionStorage.setItem(REFERRAL_STORAGE_KEY, serialized);
    },
  });
};
const inspectScreen = () => {
  cy.wait(300);
  cy.document().then((doc) =>
    expect(doc.documentElement.scrollWidth).to.be.at.most(
      doc.documentElement.clientWidth
    )
  );
  cy.checkA11y('main', {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
  });
};

describe('Acceptance checklist supplemental audit', () => {
  for (const width of [402, 1280])
    for (const area of REFERRAL_AREA_CONFIGS) {
      it(`${area.id}: all question labels, complete flow and accessibility at ${width}px`, () => {
        cy.viewport(width, 900);
        visitState({
          ...createInitialReferralState(),
          noticeAccepted: true,
          areaId: area.id,
          step: { kind: 'questions', questionIndex: 0 },
        });
        cy.injectAxe();
        for (const [index, q] of area.questions.entries()) {
          cy.contains(`質問 ${index + 1} / 7`);
          cy.get('[data-testid^="referral-answer-"]').should(
            'have.length',
            q.answers.length
          );
          for (const a of q.answers)
            cy.get(`[data-testid="referral-answer-${a.id}"]`).should(
              'have.text',
              a.label
            );
          cy.contains(
            'button',
            index === 6 ? '回答を確認する' : /^次へ$/
          ).should('be.disabled');
          inspectScreen();
          cy.get(`[data-testid="referral-answer-${q.answers[0].id}"]`).click();
          cy.contains(
            'button',
            index === 6 ? '回答を確認する' : /^次へ$/
          ).click();
        }
        cy.contains('button', /^次へ$/).should('be.disabled');
        inspectScreen();
        cy.get('[data-testid^="referral-main-"]').first().click();
        cy.contains('button', /^次へ$/).click();
        inspectScreen();
        cy.get('[data-testid^="referral-other-"]').then((items) => {
          for (let i = 0; i < Math.min(3, items.length); i++)
            cy.wrap(items[i]).click();
        });
        cy.contains('button', /^次へ$/).click();
        inspectScreen();
        cy.contains('button', '完了').click();
        inspectScreen();
        cy.get('[data-testid="referral-letter"]').should(
          'not.contain',
          'メールアドレス'
        );
        cy.get(
          '[data-testid="referral-letter"] [data-testid="referral-urgency-badge"]'
        ).should('not.exist');
        cy.screenshot(`acceptance-${area.id}-${width}-result`, {
          capture: 'fullPage',
        });
        cy.contains('button', '最初からやり直す').click();
        cy.location('pathname').should('eq', '/');
        cy.get('[data-testid="referral-letter-button"]').click();
        cy.contains('紹介状をつくる');
      });
    }

  it('preserves contents after a forced PNG failure and retries with actual PNG bytes', () => {
    visitState(seed(REFERRAL_AREA_CONFIGS[0]));
    let original;
    cy.window().then((win) => {
      original = win.HTMLCanvasElement.prototype.toDataURL;
      cy.stub(win.HTMLCanvasElement.prototype, 'toDataURL').throws(
        new Error('Acceptance audit: forced export failure')
      );
    });
    cy.contains('button', 'スクリーンショットで保存').click();
    cy.get('[data-testid="referral-export-error"]').should(
      'contain',
      '画像を保存できませんでした'
    );
    cy.get('[data-testid="referral-letter"]').should('contain', '主な困りごと');
    cy.window().then((win) => {
      win.HTMLCanvasElement.prototype.toDataURL = original;
      cy.stub(win.HTMLAnchorElement.prototype, 'click').callsFake(function () {
        expect(this.href).to.match(/^data:image\/png;base64,/);
        win.__auditPng = this.href.split(',')[1];
      });
    });
    cy.contains('button', 'スクリーンショットで保存').click();
    cy.window()
      .its('__auditPng', { timeout: 30000 })
      .should('be.a', 'string')
      .then((bytes) =>
        cy.writeFile(
          'cypress/screenshots/acceptance-export.png',
          bytes,
          'base64'
        )
      );
    cy.get('[data-testid="referral-export-error"]').should('not.exist');
  });

  it('documents whether the no-concerns branch is reachable with current data', () => {
    const blockers = REFERRAL_AREA_CONFIGS.map((area) => ({
      area: area.id,
      unavoidableCandidates: area.questions
        .filter((q) => q.answers.every(isReferralCandidateAnswer))
        .map((q) => q.label),
    }));
    cy.writeFile(
      'cypress/screenshots/acceptance-no-concerns-reachability.json',
      blockers
    );
    expect(
      blockers.every((area) => area.unavoidableCandidates.length === 0)
    ).to.equal(true);
  });

  it('checks question backtracking, zero other concerns, email limit and trimming', () => {
    const area = REFERRAL_AREA_CONFIGS[0];
    const state = seed(area, { kind: 'questions', questionIndex: 1 });
    visitState(state);
    cy.contains('button', /^前へ$/).click();
    cy.get(
      `[data-testid="referral-answer-${state.answers[area.questions[0].id]}"]`
    ).should('have.attr', 'aria-pressed', 'true');
    const q = area.questions[0];
    const a = q.answers[0];
    state.answers[q.id] = a.id;
    state.mainConcernId = q.id;
    state.otherConcernIds = [];
    state.step = { kind: 'other-concerns' };
    visitState(state);
    cy.contains('button', /^次へ$/)
      .should('be.enabled')
      .click();
    cy.get('input[name="email"]')
      .type('a'.repeat(255), { delay: 0 })
      .invoke('val')
      .should('have.length', 254);
    cy.get('input[name="email"]').clear().type(' test@example.com ');
    cy.get('input[name="name"]').type(' 検収テスト ');
    cy.get('textarea[name="message"]').type(' 確認用の文章 ');
    cy.contains('button', '完了').click();
    cy.get('[data-testid="referral-letter"]')
      .should('not.contain', '相談先')
      .and('not.contain', '他の困りごと');
    cy.get('[data-testid="referral-letter"]')
      .invoke('text')
      .then((text) => {
        for (const value of [
          '検収テスト',
          'test@example.com',
          '確認用の文章',
        ]) {
          expect(text).to.contain(value);
          expect(text).not.to.contain(` ${value} `);
        }
      });
    cy.contains('a', 'くわしく計算').click();
    cy.location('pathname').should('eq', '/calculate');
    cy.contains('あなたについて');
    cy.get('body').should('not.contain', '検収テスト');
  });

  it('checks print-media visibility, A4 settings and restores screen media', () => {
    visitState(seed(REFERRAL_AREA_CONFIGS[0]));
    cy.get('[data-referral-print-page]').should('contain', 'A4 portrait');
    cy.get('.referral-print-cutline').should('not.be.visible');
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: { media: 'print' },
      })
    );
    cy.get('.referral-no-print').each((el) =>
      cy.wrap(el).should('have.css', 'display', 'none')
    );
    cy.get('.referral-print-card').each((el) => {
      cy.wrap(el).should('have.css', 'visibility', 'visible');
      cy.wrap(el).should('have.css', 'break-inside', 'avoid');
    });
    cy.get('.referral-print-cutline').should('be.visible');
    cy.screenshot('acceptance-print-media', { capture: 'fullPage' });
    cy.then(() =>
      Cypress.automation('remote:debugger:protocol', {
        command: 'Emulation.setEmulatedMedia',
        params: { media: '' },
      })
    );
    cy.get('.referral-print-cutline').should('not.be.visible');
  });
});
