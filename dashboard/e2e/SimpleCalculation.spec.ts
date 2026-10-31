import { test } from '@playwright/test';
import loanResponse from '../src/mocks/calculate/loan-only.response.json';
import {
  answerAddress,
  answerAmount,
  answerChoice,
  expectCalculationInput,
  expectLoanResult,
  startCalculation,
  waitForCalculation,
} from './helpers';

test('かんたん見積もりで同意・入力・送信から貸付結果まで進む', async ({
  page,
}) => {
  await page.route('**/calculate', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    await route.fulfill({ json: loanResponse });
  });
  await startCalculation(page, 'simple');
  await answerAddress(page);
  await answerAmount(page, '年収');
  await answerChoice(page, '配偶者はいますか？', 'いいえ');

  const calculation = waitForCalculation(page);
  await answerChoice(page, '子どもの人数', 'いいえ');
  expectCalculationInput(await calculation, []);
  await expectLoanResult(page);
});
