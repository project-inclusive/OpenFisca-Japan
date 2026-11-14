import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import benefitOnly from '../../src/mocks/calculate/benefit-only.response.json';
import loanOnly from '../../src/mocks/calculate/loan-only.response.json';
import both from '../../src/mocks/calculate/both.response.json';
import none from '../../src/mocks/calculate/none.response.json';
import { requireBaselines } from './baselines';

const STOP_MOTION =
  '*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}';

async function settle(page: Page) {
  await page.addStyleTag({ content: STOP_MOTION });
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
}

async function start(page: Page, mode: 'simple' | 'detailed') {
  await page.goto('/');
  await settle(page);
  await page
    .getByTestId(
      mode === 'simple' ? 'calculate-simple-button' : 'calculate-detail-button'
    )
    .click();
}

async function agree(page: Page) {
  await page.getByTestId('restrictions-checkbox').click();
  await page.getByTestId('terms-checkbox').click();
  await page.getByTestId('start-button').click();
}

const next = (page: Page) =>
  page.getByRole('button', { name: '次へ', exact: true }).click();

async function address(page: Page) {
  await start(page, 'simple');
  await agree(page);
  await page.getByTestId('select-prefecture').selectOption('東京都');
  await page.getByTestId('select-city').selectOption('渋谷区');
  await next(page);
}

async function income(page: Page) {
  await address(page);
  await page.getByTestId('amount-input').fill('0');
  await next(page);
}

async function simpleToResult(page: Page, response: object | 500) {
  await page.route('**/calculate', (route) =>
    route.request().method() === 'POST'
      ? response === 500
        ? route.fulfill({ status: 500, body: 'Calculation failed' })
        : route.fulfill({ json: response })
      : route.continue()
  );
  await income(page);
  await page.getByRole('button', { name: 'いいえ', exact: true }).click();
  await next(page);
  await page.getByRole('button', { name: 'いいえ', exact: true }).click();
  await next(page);
  await expect(page).toHaveURL(
    response === 500 ? /\/response-error$/ : /\/result$/
  );
  await page.waitForTimeout(800);
}

const scenarios: Record<string, (page: Page) => Promise<unknown>> = {
  top: (page) => page.goto('/'),
  'terms-modal': (page) => start(page, 'simple'),
  'simple-q1-address': async (page) => {
    await start(page, 'simple');
    await agree(page);
  },
  'simple-q2-income': address,
  'simple-q3-spouse': income,
  'detailed-q1-address': async (page) => {
    await start(page, 'detailed');
    await agree(page);
  },
  'result-benefit-only': (page) => simpleToResult(page, benefitOnly),
  'result-loan-only': (page) => simpleToResult(page, loanOnly),
  'result-both': (page) => simpleToResult(page, both),
  'result-none': (page) => simpleToResult(page, none),
  'error-api-500': (page) => simpleToResult(page, 500),
  'not-found': (page) => page.goto('/no-such-page'),
  'disaster-q1': async (page) => {
    await page.goto('/');
    await settle(page);
    await page.getByText('地震被災者支援制度見積もり', { exact: true }).click();
    await agree(page);
  },
};

test.beforeAll(async ({}, testInfo) => {
  const capture = process.env.VISUAL_CAPTURE === '1';
  if (!capture && testInfo.config.updateSnapshots !== 'none') {
    throw new Error(
      'Snapshot updates require bash e2e/visual/docker.sh capture.'
    );
  }
  requireBaselines(
    Object.keys(scenarios).flatMap((name) => [
      testInfo.snapshotPath(`${name}.png`, { kind: 'screenshot' }),
      testInfo.snapshotPath(`${name}.aria.yml`, { kind: 'aria' }),
    ]),
    capture
  );
});

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-01-15T12:00:00+09:00'));
  await page.route(
    /fonts\.(googleapis|gstatic)\.com|googletagmanager\.com|google-analytics\.com/,
    (route) => route.abort()
  );
});

for (const [name, run] of Object.entries(scenarios)) {
  test(name, async ({ page }) => {
    await run(page);
    await settle(page);
    await expect.soft(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
    await expect.soft(page.locator('body')).toMatchAriaSnapshot({
      name: `${name}.aria.yml`,
    });
  });
}
