import { test, expect } from '@playwright/test';
import bothResponse from '../src/mocks/calculate/both.response.json';
import {
  answerAddress,
  answerAmount,
  answerChoice,
  expectCalculationInput,
  expectLoanResult,
  next,
  startCalculation,
  waitForCalculation,
} from './helpers';

test('くわしく見積もりで同意・家族の入力・送信から給付と貸付の結果まで進む', async ({
  page,
}) => {
  await page.route('**/calculate', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    await route.fulfill({ json: bothResponse });
  });
  await startCalculation(page, 'detailed');
  await answerAddress(page);
  await page.getByRole('textbox', { name: '年齢', exact: true }).fill('36');
  await next(page);
  await answerAmount(page, '年収');
  await answerAmount(page, '預貯金');
  await answerChoice(page, '現在仕事をしていますか？', 'いいえ');
  await answerChoice(
    page,
    '病気やけが、障害はありますか？（複数選択可）',
    'いずれでもない'
  );
  await answerChoice(page, '介護施設に入所していますか？', 'いいえ');
  await answerChoice(
    page,
    '高校、大学、専門学校、職業訓練学校等の学生ですか？',
    'いいえ'
  );
  await answerChoice(page, '家を借りたいですか？', 'いいえ');
  await answerChoice(page, '妊娠中、または産後6ヵ月以内ですか？', 'いいえ');
  await answerChoice(
    page,
    '困りごとはありますか？（複数選択可）',
    'いずれでもない'
  );
  await answerChoice(page, '配偶者はいますか？', 'いいえ');

  await expect(page.getByText('子どもの人数', { exact: true })).toBeVisible();
  await page.getByRole('textbox').fill('1');
  await next(page);
  await expect(
    page.getByText('子ども（1人目）について', { exact: true })
  ).toBeVisible();
  await page.getByRole('textbox', { name: '年齢', exact: true }).fill('2');
  await next(page);
  await answerChoice(page, '高校に通っていますか？', 'いいえ');
  await answerChoice(page, '現在仕事をしていますか？', 'いいえ');
  await answerChoice(
    page,
    '病気やけが、障害はありますか？（複数選択可）',
    'いずれでもない'
  );
  await answerChoice(page, '介護施設に入所していますか？', 'いいえ');

  const calculation = waitForCalculation(page);
  await answerChoice(page, '親の人数', 'いいえ');
  expectCalculationInput(await calculation, ['子ども1']);
  await expectLoanResult(page);
  await expect(
    page.getByText('給付される可能性のあるお金', { exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: '児童手当 1.5 万円/月', exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('button', {
      name: '児童扶養手当 1~4.5 万円/月',
      exact: true,
    })
  ).toBeVisible();
});
