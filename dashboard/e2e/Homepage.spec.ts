import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('トップに見出しを表示する', async ({ page }) => {
  await expect(
    page.getByText('受けられそうな支援をかんたん見積もり', { exact: true })
  ).toBeVisible();
});

test('かんたん見積もりの入り口を表示する', async ({ page }) => {
  await expect(page.getByTestId('calculate-simple-button')).toHaveText(
    'かんたん見積もり'
  );
  await expect(page.getByTestId('calculate-simple-button')).toBeVisible();
});

test('くわしく見積もりの入り口を表示する', async ({ page }) => {
  await expect(page.getByTestId('calculate-detail-button')).toHaveText(
    'くわしく見積もり'
  );
  await expect(page.getByTestId('calculate-detail-button')).toBeVisible();
});
