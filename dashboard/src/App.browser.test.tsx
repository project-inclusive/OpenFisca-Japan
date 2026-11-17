import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, type Locator } from 'vitest/browser';
import { cleanup, render } from 'vitest-browser-react';
import App from './App';
import { TestProviders } from './components/questions/template/questionTemplateTestUtils';
import { calculationDate, calculateFixtures } from './mocks/calculateFixtures';
import { savedShareKeys } from './mocks/shareResultTestUtils';
import { currentDateAtom } from './state';

const originalUrl = window.location.href;
const originalHistoryState: unknown = window.history.state;
const modes = [
  {
    name: 'かんたん見積もり',
    label: 'かんたん見積もり',
    path: '/calculate-simple',
    afterAddress: '年収',
  },
  {
    name: 'くわしく見積もり',
    label: 'くわしく見積もり',
    path: '/calculate',
    afterAddress: '年齢',
  },
  {
    name: '地震被災者支援制度見積もり',
    label: '地震被災者支援見積もり',
    path: '/calculate-disaster',
    afterAddress: '年齢',
  },
] as const;

afterEach(async () => {
  await cleanup();
  vi.unstubAllGlobals();
  window.history.replaceState(originalHistoryState, '', originalUrl);
});

// Exercise App's real route table with the same pathname the components read.
const mount = async (path = '/', state?: unknown) => {
  window.history.replaceState({ usr: state }, '', path);
  await render(
    <TestProviders
      initializeState={({ set }) => set(currentDateAtom, calculationDate)}
    >
      <App />
    </TestProviders>
  );
};
const link = (name: string) => page.getByRole('link', { name, exact: true });
const shown = (text: string) =>
  expect
    .poll(
      () => page.getByText(text, { exact: true }).query()?.checkVisibility()
    )
    .toBe(true);
const href = (locator: Locator, path: string) =>
  expect.poll(() => locator.query()?.getAttribute('href')).toBe(path);
const pathname = (path: string) =>
  expect.poll(() => window.location.pathname).toBe(path);
const start = () => link('利用開始する');
const checkbox = (index: number) =>
  page.getByRole('checkbox', { name: '了解しました', exact: true }).nth(index);
// Both checkboxes have the same visible label, in restrictions/terms order.
// Click that label rather than Chakra's visually hidden native input.
const toggleConsent = (index: number) =>
  page.getByText('了解しました', { exact: true }).nth(index).click();
const checked = (index: number, value: boolean) =>
  expect
    .poll(() => (checkbox(index).query() as HTMLInputElement | null)?.checked)
    .toBe(value);
// The start control is a link: its destination is the consent gate.
// This stays meaningful across Chakra versions without checking disabled styles.
const startAt = (destination = '/') => href(start(), destination);
const openTerms = async (name: string) => {
  await link(name).click();
  await expect
    .poll(() => page.getByRole('dialog').query()?.checkVisibility())
    .toBe(true);
  await shown('制限事項');
  await shown('利用規約');
};
const closeTerms = async () => {
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect.poll(() => page.getByRole('dialog').query()).toBeNull();
};

describe('top page and consent before entering a mode', () => {
  it.each(modes)('requires both acknowledgements for $name', async (mode) => {
    await mount();
    await href(link(mode.name), '/');
    await openTerms(mode.name);
    await pathname('/');
    await checked(0, false);
    await checked(1, false);
    await startAt();
    await toggleConsent(0);
    await checked(0, true);
    await startAt();
    await toggleConsent(1);
    await checked(1, true);
    await startAt(mode.path);
    // The simple/detailed consent-to-result journey is covered by E2E.
  });

  it.each([0, 1])(
    'revokes consent when acknowledgement %i is cleared',
    async (index) => {
      await mount();
      await openTerms('かんたん見積もり');
      await toggleConsent(0);
      await toggleConsent(1);
      await startAt('/calculate-simple');
      await toggleConsent(index);
      await checked(index, false);
      await startAt();
      await pathname('/');
      await toggleConsent(index);
      await startAt('/calculate-simple');
    }
  );

  it('cancels consent on close and uses the newly selected mode on reopening', async () => {
    await mount();
    await openTerms('かんたん見積もり');
    await toggleConsent(0);
    await toggleConsent(1);
    await startAt('/calculate-simple');
    await closeTerms();
    await href(link('地震被災者支援制度見積もり'), '/');
    await openTerms('地震被災者支援制度見積もり');
    await checked(1, false);
    await startAt();
    await pathname('/');
    await toggleConsent(1);
    await startAt('/calculate-disaster');
    await start().click();
    await pathname('/calculate-disaster');
    await shown('地震被災者支援見積もり');
    await shown('寝泊まりしている地域');
    await expect.poll(() => page.getByRole('dialog').query()).toBeNull();
  });

  it('shows the features and footer links and opens the privacy policy', async () => {
    await mount();
    // Representative copy from each rendered Feature, not every config entry.
    for (const text of [
      'わかりやすい',
      'あなたが受けられそうな',
      '安心',
      '入力された情報はサーバーに',
      '窓口へ',
      '申請のときはお住まいの',
    ]) {
      await shown(text);
    }
    await href(link('Contact'), 'https://poverty-prevention.or.jp/');
    await href(
      link('GitHub'),
      'https://github.com/project-inclusive/OpenFisca-Japan'
    );
    await href(link('個人情報の扱いについて'), '/privacypolicy');
    await link('個人情報の扱いについて').click();
    await pathname('/privacypolicy');
    await shown('プライバシーポリシー');
    await page.getByRole('button', { name: '戻る', exact: true }).click();
    await pathname('/');
    await href(link('かんたん見積もり'), '/');
  });
});

describe('opening App routes directly', () => {
  it.each(modes)(
    'opens $path and can start the selected mode',
    async (mode) => {
      await mount(mode.path);
      await shown('あなたについて');
      // A fresh direct entry offers the mode selector before the first question.
      await page.getByRole('button', { name: mode.name, exact: true }).click();
      await page.getByRole('button', { name: '次へ', exact: true }).click();
      await shown('寝泊まりしている地域');
      await shown(mode.label);
      await page.getByRole('combobox').nth(0).selectOptions('東京都');
      await page.getByRole('combobox').nth(1).selectOptions('千代田区');
      await page.getByRole('button', { name: '次へ', exact: true }).click();
      await shown(mode.afterAddress);
      await pathname(mode.path);
    }
  );

  it('opens the privacy policy without first visiting the top page', async () => {
    await mount('/privacypolicy');
    await shown('プライバシーポリシー');
    await expect
      .poll(
        () =>
          page
            .getByRole('button', { name: '戻る', exact: true })
            .query()
            ?.checkVisibility()
      )
      .toBe(true);
    await pathname('/privacypolicy');
  });

  it('opens a saved /result URL without a navigation payload', async () => {
    const fetch = vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify(calculateFixtures.both.response), {
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );
    vi.stubGlobal('fetch', fetch);
    await mount(`/result?share=${savedShareKeys.compact}&1=0&2=0`);
    await shown('見積もり結果');
    await expect
      .poll(
        () =>
          page
            .getByRole('button', { name: '児童手当 1.5 万円/月', exact: true })
            .query()
            ?.checkVisibility()
      )
      .toBe(true);
    await expect.poll(() => fetch.mock.calls.length).toBe(1);
    await pathname('/result');
  });

  it('opens the response error with its navigation payload', async () => {
    await mount('/response-error', {
      isSimpleCalculation: false,
      isDisasterCalculation: true,
    });
    await shown('お手数ですがもう一度情報を入力してください。');
    await href(link('戻る'), '/calculate-disaster');
    await pathname('/response-error');
  });

  it('offers recovery when /response-error has no navigation payload', async () => {
    await mount('/response-error');
    await shown('お手数ですがもう一度情報を入力してください。');
    await href(link('戻る'), '/calculate');
  });

  it('shows not-found for an unknown URL and returns to the top page', async () => {
    await mount('/unknown-page');
    await shown('ページが見つかりませんでした。');
    await href(link('トップページに戻る'), '/');
    await link('トップページに戻る').click();
    await pathname('/');
    await href(link('かんたん見積もり'), '/');
  });
});
