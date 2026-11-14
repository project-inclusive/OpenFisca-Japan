import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { cleanup, render } from 'vitest-browser-react';
import { toPng } from 'html-to-image';
import {
  calculateFixtures,
  calculationDate,
} from '../../mocks/calculateFixtures';
import {
  SharedResultTestPage,
  replaceShareLocation,
  savedShareKeys,
  shareModes,
  shareQuery,
} from '../../mocks/shareResultTestUtils';

// Observe the value handed to the QR renderer without coupling tests to its
// canvas pixels or adding a QR decoder. Stories still render the real canvas.
vi.mock('qrcode.react', () => ({
  QRCodeCanvas: ({ value }: { value: string }) => (
    <output aria-label="QR コードの URL">{value}</output>
  ),
}));
vi.mock('html-to-image', () => ({ toPng: vi.fn() }));

let restoreLocation: (() => void) | undefined;
let requests: unknown[];

beforeEach(() => {
  requests = [];
  vi.stubGlobal(
    'fetch',
    vi.fn((input: unknown, init?: RequestInit) => {
      expect(String(input)).toMatch(/\/calculate$/);
      expect(init?.method).toBe('POST');
      requests.push(JSON.parse(String(init?.body)));
      return Promise.resolve(
        new Response(JSON.stringify(calculateFixtures.both.response), {
          headers: { 'Content-Type': 'application/json' },
        })
      );
    })
  );
});

afterEach(async () => {
  await cleanup();
  restoreLocation?.();
  restoreLocation = undefined;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.mocked(toPng).mockReset();
});

const mount = async (key: string, flags: string = shareModes[1].flags) => {
  const query = shareQuery(key, flags);
  restoreLocation = replaceShareLocation(query);
  await render(<SharedResultTestPage query={query} />);
};
const shown = (text: string) =>
  expect
    .poll(
      () => page.getByText(text, { exact: true }).query()?.checkVisibility()
    )
    .toBe(true);
const button = (name: string) =>
  page.getByRole('button', { name, exact: true });
const qrUrl = () =>
  page.getByRole('status', { name: 'QR コードの URL' }).element().textContent;
const resultShown = async () => {
  await shown('見積もり結果');
  await expect
    .poll(() => button('児童手当 1.5 万円/月').query()?.checkVisibility())
    .toBe(true);
};

describe('opening saved result links', () => {
  for (const format of ['compact', 'legacy'] as const) {
    it.each(shareModes)(
      `restores ${format} data and $name mode without navigation state`,
      async (mode) => {
        await mount(savedShareKeys[format], mode.flags);
        await resultShown();
        await shown(mode.label);
        await expect
          .poll(() => button('雇用保険（失業手当）').query()?.checkVisibility())
          .toBe(true);
        expect(requests).toHaveLength(1);
        expect(requests[0]).toMatchObject({
          世帯員: {
            あなた: { 収入: { [calculationDate]: 0 } },
            子ども1: { 誕生年月日: { ETERNITY: '2024-01-01' } },
          },
          世帯一覧: {
            世帯1: {
              居住都道府県: { [calculationDate]: '東京都' },
              居住市区町村: { [calculationDate]: '渋谷区' },
              子一覧: ['子ども1'],
              児童手当: { [calculationDate]: null },
            },
          },
        });
        expect(requests[0]).not.toHaveProperty('frontend');
        // Legacy '+' is recovered even when URLSearchParams interprets it as space.
        expect(qrUrl()).toBe(
          `${window.location.origin}/result${shareQuery(
            savedShareKeys[format],
            mode.flags
          )}`
        );
        if (mode.name === 'simple') {
          expect(
            page
              .getByRole('link', { name: 'くわしく見積もり', exact: true })
              .element()
              .getAttribute('href')
          ).toBe('/calculate');
        } else {
          expect(
            page
              .getByRole('link', { name: 'くわしく見積もり', exact: true })
              .query()
          ).toBeNull();
        }
        if (mode.name === 'disaster') {
          expect(
            page
              .getByRole('link', { name: '災害支援ナビゲーター' })
              .element()
              .getAttribute('href')
          ).toMatch(/^https:/);
        }
      }
    );
  }

  it('opens a legacy link that predates frontend data', async () => {
    await mount(savedShareKeys.legacyWithoutFrontend);
    await resultShown();
    expect(requests).toEqual([calculateFixtures.both.request]);
    expect(button('雇用保険（失業手当）').query()).toBeNull();
  });

  it.each(shareModes)(
    'shows an error and follows the recovery link in $name mode',
    async (mode) => {
      await mount('not-a-valid-share-key!', mode.flags);
      await expect
        .poll(
          () =>
            page
              .getByRole('heading', { name: '予期せぬエラーが発生しました' })
              .query()
              ?.checkVisibility()
        )
        .toBe(true);
      await shown('お手数ですがもう一度情報を入力してください。');
      expect(
        page.getByText('見積もり結果', { exact: true }).query()
      ).toBeNull();
      const back = page.getByRole('link', { name: '戻る', exact: true });
      expect(back.element().getAttribute('href')).toBe(mode.back);
      await back.click();
      await expect
        .poll(
          () =>
            page.getByRole('status', { name: '移動先' }).query()?.textContent
        )
        .toBe(mode.back);
    }
  );
});

describe('sharing a result', () => {
  it.each(shareModes)(
    'copies the current URL and supplies the same URL to QR in $name mode',
    async (mode) => {
      await mount(savedShareKeys.compact, mode.flags);
      await resultShown();
      const writeText = vi
        .spyOn(navigator.clipboard, 'writeText')
        .mockResolvedValue();
      await button('結果のリンクをコピー').click();
      await expect.poll(() => writeText.mock.calls.length).toBe(1);
      const copied = writeText.mock.calls[0][0];
      const url = new URL(copied);
      expect(url.origin).toBe(window.location.origin);
      expect(url.pathname).toBe('/result');
      expect(url.searchParams.get('share')).toBe(savedShareKeys.compact);
      const flags = new URLSearchParams(mode.flags);
      expect(url.searchParams.get('1')).toBe(flags.get('1'));
      expect(url.searchParams.get('2')).toBe(flags.get('2'));
      await shown('クリップボードにコピーしました');
      expect(qrUrl()).toBe(copied);
      await expect
        .poll(() => button('結果のリンクをコピー').query()?.checkVisibility(), {
          timeout: 5000,
        })
        .toBe(true);
    }
  );

  it('currently shows the copied message even when the clipboard rejects', async () => {
    await mount(savedShareKeys.compact);
    await resultShown();
    const rejection = new DOMException(
      'Clipboard access denied',
      'NotAllowedError'
    );
    const writeText = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockRejectedValue(rejection);
    const error = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    await button('結果のリンクをコピー').click();
    await expect
      .poll(() => error.mock.calls)
      .toContainEqual(['Failed to copy text:', rejection]);
    // Characterize the existing UI; correcting the false success message is a
    // separate application change. The QR remains usable after denial.
    await shown('クリップボードにコピーしました');
    expect(qrUrl()).toBe(writeText.mock.calls[0][0]);
    await expect
      .poll(() => button('結果のリンクをコピー').query()?.checkVisibility(), {
        timeout: 5000,
      })
      .toBe(true);
  });
});

it('saves the result as an image and clears the loading state', async () => {
  await mount(savedShareKeys.compact);
  await resultShown();
  let resolveImage!: (data: string) => void;
  vi.mocked(toPng).mockImplementation(
    () =>
      new Promise<string>((resolve) => {
        resolveImage = resolve;
      })
  );
  const downloads: { href: string; name: string }[] = [];
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
    this: HTMLAnchorElement
  ) {
    downloads.push({ href: this.href, name: this.download });
  });
  await button('このページを画像で保存').click();
  await expect.poll(() => vi.mocked(toPng).mock.calls.length).toBe(1);
  const [node, options] = vi.mocked(toPng).mock.calls[0];
  expect(node).toBeInstanceOf(HTMLElement);
  expect(node.textContent).toContain('見積もり結果');
  expect(node.textContent).toContain('児童手当');
  expect(options).toMatchObject({ backgroundColor: '#C4F1F9' });
  await shown('読み込み中...');
  expect(
    (
      page
        .getByRole('button', { name: /読み込み中/ })
        .element() as HTMLButtonElement
    ).disabled
  ).toBe(true);
  expect(downloads).toEqual([]);
  const dataUri = 'data:image/png;base64,iVBORw0KGgo=';
  resolveImage(dataUri);
  await expect.poll(() => downloads.length).toBe(1);
  expect(downloads[0]).toEqual({
    href: dataUri,
    name: expect.stringMatching(/^見積もり結果_\d{12}\.png$/),
  });
  await expect
    .poll(
      () =>
        (button('このページを画像で保存').query() as HTMLButtonElement | null)
          ?.disabled
    )
    .toBe(false);
});
