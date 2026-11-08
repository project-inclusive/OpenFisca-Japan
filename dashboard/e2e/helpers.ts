import { expect, Page, Request } from '@playwright/test';
import { calculationDate } from '../src/mocks/calculateFixtures';

export async function startCalculation(
  page: Page,
  mode: 'simple' | 'detailed'
) {
  await page.clock.setFixedTime(new Date(`${calculationDate}T12:00:00+09:00`));
  await page.goto('/');
  await page
    .getByTestId(
      mode === 'simple' ? 'calculate-simple-button' : 'calculate-detail-button'
    )
    .click();
  await page.getByTestId('restrictions-checkbox').click();
  await page.getByTestId('terms-checkbox').click();
  await page.getByTestId('start-button').click();
  await expect(page).toHaveURL(
    mode === 'simple' ? /\/calculate-simple$/ : /\/calculate$/
  );
  await expect(page.getByText('あなたについて', { exact: true })).toBeVisible();
  await expect(
    page.getByText(
      mode === 'simple' ? 'かんたん見積もり' : 'くわしく見積もり',
      { exact: true }
    )
  ).toBeVisible();
}

export async function next(page: Page) {
  await page.getByRole('button', { name: '次へ', exact: true }).click();
}

export async function answerChoice(
  page: Page,
  question: string,
  answer: string
) {
  await expect(page.getByText(question, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: answer, exact: true }).click();
  await next(page);
}

export async function answerAmount(page: Page, question: string) {
  await expect(page.getByText(question, { exact: true })).toBeVisible();
  await page.getByTestId('amount-input').fill('0');
  await next(page);
}

export async function answerAddress(page: Page) {
  await page.getByTestId('select-prefecture').selectOption('東京都');
  await page.getByTestId('select-city').selectOption('渋谷区');
  await next(page);
}

export function waitForCalculation(page: Page) {
  return page.waitForRequest(
    (request) =>
      request.method() === 'POST' &&
      new URL(request.url()).pathname === '/calculate'
  );
}

export function expectCalculationInput(request: Request, children: string[]) {
  expect(request.headers()['content-type']).toBe('application/json');
  expect(request.postDataJSON()).toMatchObject({
    世帯員: { あなた: { 収入: { [calculationDate]: 0 } } },
    世帯一覧: {
      世帯1: {
        親一覧: ['あなた'],
        子一覧: children,
        居住都道府県: { [calculationDate]: '東京都' },
        居住市区町村: { [calculationDate]: '渋谷区' },
        生活支援費: { [calculationDate]: null },
        緊急小口資金: { [calculationDate]: null },
      },
    },
  });
}

export async function expectLoanResult(page: Page) {
  await expect(page).toHaveURL(/\/result$/);
  await expect(page.getByText('見積もり結果', { exact: true })).toBeVisible();
  await expect(
    page.getByText('借りられる可能性のあるお金', { exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: '生活支援費 ~15 万円/月', exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: '緊急小口資金 ~20 万円', exact: true })
  ).toBeVisible();
}
