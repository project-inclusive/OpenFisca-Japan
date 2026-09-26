/// <reference types="cypress" />

import {
  REFERRAL_AREA_CONFIGS,
  getReferralAreaConfig,
} from '../../src/components/referral-letter/config';
import {
  MAX_OTHER_CONCERNS,
  REFERRAL_URGENCY_LABELS,
  createReferralDocument,
  deriveConcernCandidates,
  createDestinationInstruction,
  isReferralCandidateAnswer,
  isValidReferralEmail,
  reconcileConcernSelection,
} from '../../src/components/referral-letter/logic';
import {
  REFERRAL_INPUT_LIMITS,
  REFERRAL_STORAGE_KEY,
  LEGACY_REFERRAL_STORAGE_KEY,
  createInitialReferralState,
  referralReducer,
  sanitizeReferralState,
} from '../../src/components/referral-letter/state';

const TEST_NAME = 'ヤドカリ 花子';
const TEST_EMAIL = 'hanako@example.com';
const TEST_MESSAGE = '窓口で相談したいです';

const getAnswer = (question, predicate) => {
  const answer = question.answers.find(predicate);
  expect(answer, `answer for ${question.id}`).to.exist;
  return answer;
};

const answersFor = (areaId, predicate) => {
  const area = getReferralAreaConfig(areaId);
  return Object.fromEntries(
    area.questions.map((question) => [
      question.id,
      getAnswer(question, predicate).id,
    ])
  );
};

const answerAll = (state, predicate) => {
  const area = getReferralAreaConfig(state.areaId);
  return area.questions.reduce(
    (nextState, question) =>
      referralReducer(nextState, {
        type: 'ANSWER_QUESTION',
        questionId: question.id,
        answerId: getAnswer(question, predicate).id,
      }),
    state
  );
};

const visitFreshReferral = () => {
  cy.visit('/referral-letter', {
    onBeforeLoad(window) {
      window.sessionStorage.removeItem(REFERRAL_STORAGE_KEY);
    },
  });
};

const beginReferral = (areaId) => {
  visitFreshReferral();
  cy.contains('紹介状をつくる');
  cy.get('[data-testid="referral-start-button"]')
    .contains('注意事項を確認する')
    .click();

  cy.contains('利用前の確認');
  cy.contains('button', /^次へ$/).should('be.disabled');
  cy.get('[data-testid="referral-notice-checkbox"]').click();
  cy.contains('button', /^次へ$/)
    .should('not.be.disabled')
    .click();

  cy.get(`[data-testid="referral-area-${areaId}"]`)
    .click()
    .should('have.attr', 'aria-pressed', 'true');
  cy.contains('button', /^次へ$/).click();
  cy.contains('質問 1 / 7');
};

const answerReferralQuestions = (areaId, predicate) => {
  const area = getReferralAreaConfig(areaId);
  area.questions.forEach((question, index) => {
    const answer = getAnswer(question, predicate);
    cy.get(`[data-testid="referral-answer-${answer.id}"]`)
      .click()
      .should('have.attr', 'aria-pressed', 'true');
    cy.contains(
      'button',
      index === area.questions.length - 1 ? '回答を確認する' : /^次へ$/
    ).click();
  });
};

const assertReferralA11y = () => {
  // Chakra buttons animate colour changes; wait until the transition settles so
  // axe measures the stable UI rather than an intermediate blended colour.
  cy.wait(300);
  cy.checkA11y(
    'main',
    {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa'],
      },
    },
    (violations) => {
      const summary = violations.map(({ id, impact, nodes }) => ({
        id,
        impact,
        nodes: nodes.map((node) => {
          const element = Cypress.$(node.target.join(' '))[0];
          const button = element?.closest('button');
          const computedStyle = button
            ? button.ownerDocument.defaultView.getComputedStyle(button)
            : null;
          return {
            target: node.target,
            html: node.html,
            failureSummary: node.failureSummary,
            button: button
              ? {
                  disabled: button.disabled,
                  ariaPressed: button.getAttribute('aria-pressed'),
                  style: button.getAttribute('style'),
                  opacity: computedStyle.opacity,
                  backgroundColor: computedStyle.backgroundColor,
                  color: computedStyle.color,
                }
              : null,
          };
        }),
      }));
      expect(violations, JSON.stringify(summary)).to.have.length(0);
    },
    true
  );
};

describe('Referral letter domain rules', () => {
  it('matches every source cell from the revised tabs (2026-09-26)', () => {
    // FNV-1a over JSON rows independently copied from Sheets B,D:I.
    // Numeric prefixes in B are removed; blank repeated B cells are filled down.
    const expected = {
      elderly: '958f9cdb',
      childcare: 'e2e182d0',
      'young-adult': '6e4608b7',
    };
    const labels = { none: '無', low: '低', medium: '中', high: '高' };
    const ids = [];
    REFERRAL_AREA_CONFIGS.forEach((area) => {
      expect(area.questions).to.have.length(7);
      const rows = area.questions.flatMap((question) => {
        ids.push(question.id);
        expect(question.answers).to.have.length(6);
        return question.answers.map((answer) => {
          ids.push(answer.id);
          expect(answer).not.to.have.property('score');
          expect(answer.destinations.length).to.be.at.most(2);
          if (answer.urgency !== 'none')
            expect(answer.destinations).not.to.be.empty;
          answer.destinations.forEach((destination) => {
            expect(destination.name).to.match(/\S/);
            if (destination.url)
              expect(new URL(destination.url).protocol).to.equal('https:');
          });
          return [
            question.label,
            labels[answer.urgency],
            answer.label,
            answer.destinations[0]?.name || '',
            answer.destinations[0]?.url || '',
            answer.destinations[1]?.name || '',
            answer.destinations[1]?.url || '',
          ];
        });
      });
      let hash = 2166136261;
      for (const character of JSON.stringify(rows).split(''))
        hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0;
      expect(hash.toString(16), area.id).to.equal(expected[area.id]);
    });
    expect(new Set(ids).size).to.equal(ids.length);
  });

  it('uses the new urgency column, never the former numeric score', () => {
    [
      'childcare-child-future',
      'childcare-career-plan',
      'young-adult-career-plan',
    ].forEach((id) => {
      const question = REFERRAL_AREA_CONFIGS.flatMap(
        (area) => area.questions
      ).find((q) => q.id === id);
      expect(question.answers.map((a) => a.urgency)).to.deep.equal([
        'medium',
        'medium',
        'low',
        'none',
        'none',
        'none',
      ]);
    });
    const question = getReferralAreaConfig('childcare').questions[1];
    expect(question.answers[3].urgency).to.equal('low');
    expect(
      isReferralCandidateAnswer({
        urgency: 'none',
        destinations: [{ name: '紹介先があっても候補外', url: null }],
      })
    ).to.equal(false);
  });

  it('keeps the selected destinations, URLs and urgency for all 90 candidate answers', () => {
    let checked = 0;
    REFERRAL_AREA_CONFIGS.forEach((area) => {
      area.questions.forEach((question) => {
        question.answers.filter(isReferralCandidateAnswer).forEach((answer) => {
          const answers = answersFor(area.id, () => true);
          answers[question.id] = answer.id;
          const candidate = deriveConcernCandidates(area.id, answers).find(
            (c) => c.questionId === question.id
          );
          const document = createReferralDocument({
            ...createInitialReferralState(),
            areaId: area.id,
            answers,
            mainConcernId: question.id,
          });
          expect(candidate.destinations).to.deep.equal(answer.destinations);
          expect(candidate.urgencyLevel).to.equal(answer.urgency);
          expect(document.guide.concerns[0].destinations).to.deep.equal(
            answer.destinations
          );
          expect(document.guide.searchMethods).to.deep.equal(
            answer.destinations.map((destination) => ({
              destination,
              instruction: createDestinationInstruction(destination),
            }))
          );
          expect(document.guide.contactInstruction).to.equal(
            `連絡先が見つかった場合は、窓口に電話し「${question.label}について相談したい」と伝えてください。`
          );
          expect(document.letter.otherConcerns).to.deep.equal([]);
          checked++;
        });
      });
    });
    expect(checked).to.equal(90);
  });

  it('branches each destination independently, preserving labels and removing the prefix only from search words', () => {
    const withoutLink = { name: '役所HPから「生活保護」', url: null };
    expect(createDestinationInstruction(withoutLink)).to.equal(
      'ネットで「「生活保護」 お住まいの市町村名 電話番号」で検索してください。'
    );
    expect(withoutLink.name).to.equal('役所HPから「生活保護」');
    expect(
      createDestinationInstruction({
        ...withoutLink,
        url: 'https://example.com',
      })
    ).to.include('案内ページを開き');
    REFERRAL_AREA_CONFIGS.forEach((area) => {
      expect(
        deriveConcernCandidates(
          area.id,
          answersFor(area.id, (a) => a.urgency === 'none')
        )
      ).to.deep.equal([]);
    });
  });

  it('derives candidates in question order and caps other concerns at three', () => {
    const answers = answersFor(
      'elderly',
      (answer) => answer.urgency !== 'none'
    );
    const candidates = deriveConcernCandidates('elderly', answers);

    expect(candidates).to.have.length(7);
    expect(candidates.map((candidate) => candidate.order)).to.deep.equal([
      0, 1, 2, 3, 4, 5, 6,
    ]);

    const selection = reconcileConcernSelection(candidates, candidates[1].id, [
      candidates[5].id,
      candidates[2].id,
      candidates[0].id,
      candidates[6].id,
    ]);

    expect(selection.mainConcernId).to.equal(candidates[1].id);
    expect(selection.otherConcernIds).to.deep.equal([
      candidates[0].id,
      candidates[2].id,
      candidates[5].id,
    ]);
    expect(selection.otherConcernIds).to.have.length(MAX_OTHER_CONCERNS);
  });

  it('handles one candidate answer as a single concern without other rows', () => {
    const area = getReferralAreaConfig('elderly');
    const answers = answersFor(
      'elderly',
      (answer) => answer.urgency === 'none'
    );
    const firstQuestion = area.questions[0];
    answers[firstQuestion.id] = getAnswer(
      firstQuestion,
      (answer) => answer.urgency !== 'none'
    ).id;

    const candidates = deriveConcernCandidates('elderly', answers);
    expect(candidates).to.have.length(1);
    expect(candidates[0].questionId).to.equal(firstQuestion.id);

    const selection = reconcileConcernSelection(
      candidates,
      candidates[0].id,
      candidates.map((candidate) => candidate.id)
    );
    expect(selection).to.deep.equal({
      mainConcernId: candidates[0].id,
      otherConcernIds: [],
    });

    const document = createReferralDocument({
      ...createInitialReferralState(),
      areaId: 'elderly',
      answers,
      mainConcernId: candidates[0].id,
    });
    expect(document).not.to.equal(null);
    expect(document.letter.otherConcerns).to.deep.equal([]);
  });

  it('reconciles dependent selections when answers or areas change', () => {
    let state = referralReducer(createInitialReferralState(), {
      type: 'SELECT_AREA',
      areaId: 'elderly',
    });
    state = answerAll(state, (answer) => answer.urgency !== 'none');
    const candidates = deriveConcernCandidates(state.areaId, state.answers);

    const mainCandidate = candidates[1];
    state = referralReducer(state, {
      type: 'SELECT_MAIN_CONCERN',
      concernId: mainCandidate.id,
    });
    candidates
      .filter(({ id }) => id !== mainCandidate.id)
      .slice(0, 4)
      .forEach((candidate) => {
        state = referralReducer(state, {
          type: 'TOGGLE_OTHER_CONCERN',
          concernId: candidate.id,
        });
      });
    expect(state.otherConcernIds).to.have.length(MAX_OTHER_CONCERNS);

    const mainQuestion = getReferralAreaConfig('elderly').questions.find(
      ({ id }) => id === mainCandidate.questionId
    );
    state = referralReducer(state, {
      type: 'ANSWER_QUESTION',
      questionId: mainQuestion.id,
      answerId: getAnswer(
        mainQuestion,
        (answer) => !isReferralCandidateAnswer(answer)
      ).id,
    });
    expect(state.mainConcernId).to.equal(null);

    state = referralReducer(
      {
        ...state,
        inputs: {
          name: 'ヤドカリ 花子',
          email: 'hanako@example.com',
          message: '相談したいです',
        },
      },
      { type: 'SELECT_AREA', areaId: 'childcare' }
    );
    expect(state.answers).to.deep.equal({});
    expect(state.mainConcernId).to.equal(null);
    expect(state.otherConcernIds).to.deep.equal([]);
    expect(state.inputs.name).to.equal('ヤドカリ 花子');
  });

  it('validates optional inputs, truncates limits, and omits blank rows', () => {
    const maxLengthEmail = `${'a'.repeat(242)}@example.com`;

    expect(isValidReferralEmail('')).to.equal(true);
    expect(isValidReferralEmail(' user@example.com ')).to.equal(true);
    expect(isValidReferralEmail('invalid-address')).to.equal(false);
    expect(maxLengthEmail).to.have.length(REFERRAL_INPUT_LIMITS.email);
    expect(isValidReferralEmail(maxLengthEmail)).to.equal(true);
    expect(isValidReferralEmail(`${'a'.repeat(243)}@example.com`)).to.equal(
      false
    );

    let state = referralReducer(createInitialReferralState(), {
      type: 'SELECT_AREA',
      areaId: 'elderly',
    });
    state = answerAll(state, (answer) => answer.urgency !== 'none');
    const [mainCandidate, ...otherCandidates] = deriveConcernCandidates(
      state.areaId,
      state.answers
    );
    state = referralReducer(state, {
      type: 'SELECT_MAIN_CONCERN',
      concernId: mainCandidate.id,
    });
    otherCandidates.slice(0, MAX_OTHER_CONCERNS).forEach((candidate) => {
      state = referralReducer(state, {
        type: 'TOGGLE_OTHER_CONCERN',
        concernId: candidate.id,
      });
    });

    state = referralReducer(state, {
      type: 'SET_INPUTS',
      inputs: {
        name: ' '.repeat(REFERRAL_INPUT_LIMITS.name + 1),
        email: '',
        message: '',
      },
    });
    expect(state.inputs.name).to.have.length(REFERRAL_INPUT_LIMITS.name);

    const document = createReferralDocument(state);
    expect(document).not.to.equal(null);
    expect(document.letter).not.to.have.property('name');
    expect(document.letter).not.to.have.property('email');
    expect(document.letter).not.to.have.property('message');
    expect(document.letter.otherConcerns).to.have.length(MAX_OTHER_CONCERNS);
  });

  it('rejects corrupted persisted state', () => {
    expect(sanitizeReferralState(null)).to.equal(null);
    expect(
      sanitizeReferralState({
        ...createInitialReferralState(),
        version: 999,
      })
    ).to.equal(null);
    expect(
      sanitizeReferralState({
        ...createInitialReferralState(),
        areaId: null,
        step: { kind: 'questions', questionIndex: 0 },
      })
    ).to.equal(null);
  });
});

describe('Referral letter flow', () => {
  it('does not create a letter when all answers have no urgency', () => {
    beginReferral('elderly');
    answerReferralQuestions('elderly', (answer) => answer.urgency === 'none');
    cy.contains('現在、大きな困り事はなさそうです');
    cy.get('[data-testid="referral-document"]').should('not.exist');
  });

  it('discards all legacy answers and personal inputs', () => {
    cy.visit('/referral-letter', {
      onBeforeLoad(window) {
        window.sessionStorage.removeItem(REFERRAL_STORAGE_KEY);
        window.sessionStorage.setItem(
          LEGACY_REFERRAL_STORAGE_KEY,
          JSON.stringify({
            ...createInitialReferralState(),
            version: 1,
            noticeAccepted: true,
            inputs: {
              name: TEST_NAME,
              email: TEST_EMAIL,
              message: TEST_MESSAGE,
            },
          })
        );
      },
    });
    cy.contains('紹介状をつくる');
    cy.window().then((window) => {
      expect(
        window.sessionStorage.getItem(LEGACY_REFERRAL_STORAGE_KEY)
      ).to.equal(null);
      const state = JSON.parse(
        window.sessionStorage.getItem(REFERRAL_STORAGE_KEY)
      );
      expect(state.version).to.equal(2);
      expect(state.noticeAccepted).to.equal(false);
      expect(state.inputs).to.deep.equal({ name: '', email: '', message: '' });
    });
  });

  it('creates, restores, edits, and prints a referral letter without sending PII', () => {
    const observedRequests = [];
    cy.intercept('**', (request) => {
      observedRequests.push({
        url: request.url,
        method: request.method,
        body: request.body,
      });
    });

    beginReferral('elderly');
    answerReferralQuestions('elderly', (answer) => answer.urgency !== 'none');
    cy.injectAxe();

    const candidates = deriveConcernCandidates(
      'elderly',
      answersFor('elderly', (answer) => answer.urgency !== 'none')
    );
    candidates.forEach((candidate) => {
      cy.get(`[data-testid="referral-main-${candidate.id}"]`)
        .find('[data-testid="referral-urgency-badge"]')
        .should(
          'contain',
          `緊急度：${REFERRAL_URGENCY_LABELS[candidate.urgencyLevel]}`
        )
        .and('have.attr', 'data-urgency-level', candidate.urgencyLevel);
    });
    cy.get(`[data-testid="referral-main-${candidates[0].id}"]`).click();
    cy.contains('その他の困りごとを選ぶ').should('not.exist');
    assertReferralA11y();
    cy.contains('button', /^次へ$/).click();

    cy.contains('その他の困りごとを選ぶ');
    cy.contains('選択した主な困りごと')
      .parent()
      .should('contain', candidates[0].questionLabel)
      .and(
        'contain',
        `緊急度：${REFERRAL_URGENCY_LABELS[candidates[0].urgencyLevel]}`
      );
    cy.window().then((window) => {
      const savedState = JSON.parse(
        window.sessionStorage.getItem(REFERRAL_STORAGE_KEY)
      );
      expect(savedState.step).to.deep.equal({ kind: 'other-concerns' });
    });
    cy.reload();
    cy.contains('その他の困りごとを選ぶ');
    cy.injectAxe();
    candidates.slice(1, 4).forEach((candidate) => {
      cy.get(`[data-testid="referral-other-${candidate.id}"]`)
        .should(
          'contain',
          `緊急度：${REFERRAL_URGENCY_LABELS[candidate.urgencyLevel]}`
        )
        .click()
        .should('have.attr', 'aria-pressed', 'true')
        .and('not.be.disabled');
    });
    cy.contains(`${MAX_OTHER_CONCERNS} / ${MAX_OTHER_CONCERNS}件を選択中`);
    cy.get(`[data-testid="referral-other-${candidates[4].id}"]`).should(
      'be.disabled'
    );
    assertReferralA11y();
    cy.contains('button', /^次へ$/).click();

    cy.get('input[name="name"]')
      .type('名'.repeat(REFERRAL_INPUT_LIMITS.name + 1), { delay: 0 })
      .invoke('val')
      .should('have.length', REFERRAL_INPUT_LIMITS.name);
    cy.get('input[name="name"]').clear().type(TEST_NAME);
    cy.get('textarea[name="message"]')
      .type('文'.repeat(REFERRAL_INPUT_LIMITS.message + 1), { delay: 0 })
      .invoke('val')
      .should('have.length', REFERRAL_INPUT_LIMITS.message);
    cy.get('textarea[name="message"]').clear().type(TEST_MESSAGE);
    cy.get('input[name="email"]').type('invalid-address');
    cy.contains('メールアドレスの形式で入力してください。');
    cy.contains('button', '完了').should('be.disabled');
    assertReferralA11y();
    cy.get('input[name="email"]').clear().type(TEST_EMAIL);
    cy.contains('button', '完了').should('not.be.disabled').click();

    cy.contains('紹介状ができました');
    cy.get('[data-testid="referral-guide"]').should('be.visible');
    cy.get('[data-testid="referral-guide"]')
      .find('[data-testid="referral-urgency-badge"]')
      .should('have.length', 1)
      .and(
        'contain',
        `緊急度：${REFERRAL_URGENCY_LABELS[candidates[0].urgencyLevel]}`
      );
    cy.get('[data-testid="referral-letter"]')
      .find('[data-testid="referral-urgency-badge"]')
      .should('not.exist');
    cy.get('#referral-guide-heading').should(
      'have.css',
      'text-align',
      'center'
    );
    cy.get('#referral-letter-heading').should(
      'have.css',
      'text-align',
      'center'
    );
    cy.get('[data-testid="referral-letter"]')
      .should('contain', TEST_NAME)
      .and('contain', TEST_EMAIL)
      .and('contain', TEST_MESSAGE);
    const selectedCandidates = candidates.slice(0, MAX_OTHER_CONCERNS + 1);
    cy.get('[data-testid="referral-guide"]')
      .invoke('text')
      .then((guideText) => {
        selectedCandidates.forEach((candidate) => {
          expect(guideText).to.include(candidate.questionLabel);
          candidate.destinations.forEach((destination) => {
            expect(guideText).to.include(destination.name);
            if (destination.url) expect(guideText).to.include(destination.url);
          });
        });
      });
    cy.get('[data-testid="referral-letter"]').within(() => {
      selectedCandidates.forEach((candidate, index) => {
        const title =
          index === 0
            ? '主な困りごと'
            : `他の困りごと${['①', '②', '③'][index - 1]}`;
        cy.contains(
          'p',
          `${title}：${candidate.questionLabel}（${candidate.answerLabel}）`
        );
      });
    });
    cy.get('[data-testid="referral-letter"]')
      .invoke('text')
      .then((letterText) => {
        selectedCandidates.forEach((candidate) => {
          expect(letterText).to.include(candidate.questionLabel);
          expect(letterText).not.to.include('相談先');
        });
      });
    cy.contains(
      '氏名・メールアドレス等を含む場合があります。保存先や共有相手をご確認ください。'
    );
    cy.contains('button', 'スクリーンショットで保存').should('be.enabled');
    cy.contains('a', 'くわしく計算').should('have.attr', 'href', '/calculate');
    cy.contains('a', 'アンケートに答える').should(
      'have.attr',
      'target',
      '_blank'
    );
    cy.contains('button', 'スクリーンショットで保存').should(($button) => {
      expect($button.css('background-color')).not.to.equal('rgba(0, 0, 0, 0)');
    });
    [
      ['button', '印刷（PC向け）'],
      ['button', '回答を編集'],
      ['a', 'くわしく計算'],
      ['a', 'アンケートに答える'],
      ['button', '最初からやり直す'],
    ].forEach(([element, label]) => {
      cy.contains(element, label).should(($action) => {
        expect($action.css('background-color')).to.equal('rgba(0, 0, 0, 0)');
      });
    });
    cy.contains('button', '最初からやり直す')
      .should('have.css', 'border-top-style', 'solid')
      .and('have.css', 'border-top-width', '1px');
    assertReferralA11y();

    cy.window().then((window) => {
      cy.stub(window.HTMLAnchorElement.prototype, 'click').as('downloadClick');
    });
    cy.contains('button', 'スクリーンショットで保存').click();
    cy.get('@downloadClick', { timeout: 20000 }).should('have.been.calledOnce');
    cy.get('[data-testid="referral-export-error"]').should('not.exist');

    cy.url()
      .should('not.include', encodeURIComponent(TEST_NAME))
      .and('not.include', TEST_EMAIL)
      .and('not.include', encodeURIComponent(TEST_MESSAGE));

    cy.reload();
    cy.contains('紹介状ができました');
    cy.get('[data-testid="referral-letter"]').should('contain', TEST_EMAIL);
    cy.contains('button', '回答を編集').click();
    cy.get('input[name="name"]').should('have.value', TEST_NAME);
    cy.get('input[name="email"]').should('have.value', TEST_EMAIL);
    cy.get('textarea[name="message"]').should('have.value', TEST_MESSAGE);
    cy.contains('button', /^前へ$/).click();
    cy.contains('その他の困りごとを選ぶ');
    candidates.slice(1, 4).forEach((candidate) => {
      cy.get(`[data-testid="referral-other-${candidate.id}"]`).should(
        'have.attr',
        'aria-pressed',
        'true'
      );
    });
    cy.contains('button', /^前へ$/).click();
    cy.get(`[data-testid="referral-main-${candidates[0].id}"]`).should(
      'have.attr',
      'aria-pressed',
      'true'
    );
    cy.contains('button', /^次へ$/).click();
    cy.contains('その他の困りごとを選ぶ');
    cy.contains('button', /^次へ$/).click();
    cy.contains('button', '完了').click();

    cy.window().then((window) => {
      cy.stub(window, 'print').as('printDialog');
    });
    cy.contains('button', '印刷（PC向け）').click();
    cy.get('@printDialog').should('have.been.calledOnce');

    cy.then(() => {
      const serializedRequests = JSON.stringify(observedRequests);
      [TEST_NAME, TEST_EMAIL, TEST_MESSAGE].forEach((value) => {
        expect(serializedRequests).not.to.include(value);
      });
      expect(
        observedRequests.some(
          ({ url }) => new URL(url).pathname === '/calculate'
        )
      ).to.equal(false);
    });
  });

  it('discards corrupted session data and starts from the description', () => {
    cy.visit('/referral-letter', {
      onBeforeLoad(window) {
        window.sessionStorage.setItem(REFERRAL_STORAGE_KEY, '{broken-json');
      },
    });

    cy.contains('紹介状をつくる');
    cy.window().then((window) => {
      const savedState = JSON.parse(
        window.sessionStorage.getItem(REFERRAL_STORAGE_KEY)
      );
      expect(savedState.step).to.deep.equal({ kind: 'description' });
    });
  });

  [
    { name: 'mobile', width: 402, height: 844 },
    { name: 'desktop', width: 1280, height: 900 },
  ].forEach(({ name, width, height }) => {
    it(`is accessible without horizontal overflow on ${name}`, () => {
      cy.viewport(width, height);
      visitFreshReferral();
      cy.injectAxe();
      assertReferralA11y();
      cy.document().then((document) => {
        expect(document.documentElement.scrollWidth).to.be.at.most(
          document.documentElement.clientWidth
        );
      });
    });
  });
});
