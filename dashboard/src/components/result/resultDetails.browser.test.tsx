import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { cleanup, render } from 'vitest-browser-react';
import configData from '../../config/app_config.json';
import { data as socialWelfareData } from '../../config/社会福祉協議会';
import { baseHospitalData } from '../../config/拠点病院';
import { childAllowanceData } from '../../config/子育て';
import {
  ResultDetailsTestPage,
  Residence,
  ResultDetailsView,
  calculationResult,
  googleMapsUrl,
} from '../../mocks/resultDetailsTestUtils';

const restores: (() => void)[] = [];

afterEach(async () => {
  await cleanup();
  restores.splice(0).forEach((restore) => restore());
});

// render() flushes React effects, so residence-dependent state is settled.
const mount = (
  residence: Residence,
  view: ResultDetailsView,
  amounts?: Record<string, number>
) =>
  render(
    <ResultDetailsTestPage
      result={calculationResult({ residence, amounts })}
      view={view}
    />
  );
const helpDesk = (name: string): ResultDetailsView => ({
  kind: 'helpDesk',
  name,
});
const link = (name: string) => page.getByRole('link', { name, exact: true });
const visible = (locator: ReturnType<typeof link>) =>
  expect.poll(() => locator.query()?.checkVisibility()).toBe(true);

describe('social welfare council help desk', () => {
  it.each(['saitamaCity', 'sapporo'] as const)(
    'explains how to find a council for an unsupported residence (%s)',
    async (residence) => {
      await mount(residence, helpDesk('socialWelfareCouncil'));
      await visible(page.getByText('社会福祉協議会の調べ方', { exact: true }));
      await expect
        .element(page.getByRole('link', { name: '全国の社会福祉協議会一覧' }))
        .toHaveAttribute('href', 'https://www.zcwvc.net/about/list.html');
      expect(link('地図を開く').query()).toBeNull();
      expect(page.getByText('TEL:').query()).toBeNull();
    }
  );

  // The configured website URL field holds the facility name for these cities,
  // so the facility name links to a relative path instead of a website.
  for (const [residence, council] of [
    ['hamura', '羽村市社会福祉協議会'],
    ['toshima', '利島村社会福祉協議会'],
  ] as const) {
    it.fails(
      `does not link the facility name to a non-URL value (${residence})`,
      async () => {
        await mount(residence, helpDesk('socialWelfareCouncil'));
        await visible(link('地図を開く'));
        await visible(page.getByText(council, { exact: true }));
        const href = link(council).query()?.getAttribute('href') ?? null;
        // Correct data either links to a website or shows plain text.
        expect(href === null || /^https?:\/\//.test(href)).toBe(true);
      }
    );
  }
});

describe('municipal help desk', () => {
  it.each(['chiyoda', 'saitamaCity'] as const)(
    'shows nothing when the residence has no help desk (%s)',
    async (residence) => {
      const screen = await mount(residence, helpDesk('childAllowance'));
      expect(screen.container.textContent).toBe('');
    }
  );
});

// Every help desk links its name only when a website URL is configured, and
// always links to the map and phone number.
const deskEntries = [
  {
    name: 'socialWelfareCouncil',
    residence: 'chiyoda',
    entry: () => socialWelfareData.東京都.千代田区,
  },
  {
    name: 'childAllowance',
    residence: 'fujimi',
    entry: () => childAllowanceData.埼玉県.富士見市,
  },
  {
    // Also listed regionally; the prefectural copy is the one shown.
    name: 'baseHospital',
    residence: 'sendai',
    entry: () =>
      baseHospitalData.中核拠点病院.宮城県
        .独立行政法人国立病院機構仙台医療センター,
  },
] as const;

describe.each(deskEntries)('$name help desk', ({ name, residence, entry }) => {
  const expectContactLinks = async () => {
    const { 施設名, 所在地, 電話番号 } = entry();
    await visible(link('地図を開く'));
    await expect
      .element(link('地図を開く'))
      .toHaveAttribute('href', googleMapsUrl(施設名, 所在地));
    await expect
      .element(link(電話番号))
      .toHaveAttribute('href', `tel:${電話番号}`);
    await expect.element(page.getByText(所在地, { exact: true })).toBeVisible();
  };

  it('links the facility name to its website', async () => {
    await mount(residence, helpDesk(name));
    await expectContactLinks();
    await expect
      .element(link(entry().施設名))
      .toHaveAttribute('href', entry().WebサイトURL);
  });

  it('shows the facility name as text without a website', async () => {
    const original = entry().WebサイトURL;
    restores.push(() => {
      entry().WebサイトURL = original;
    });
    entry().WebサイトURL = '';
    await mount(residence, helpDesk(name));
    await expectContactLinks();
    await visible(page.getByText(entry().施設名, { exact: true }));
    expect(link(entry().施設名).query()).toBeNull();
  });
});

describe('results without positive amounts', () => {
  const zeroAmounts = {
    児童手当: 0,
    児童扶養手当_最小: 0,
    児童扶養手当_最大: 0,
    生活支援費: 0,
    受験生チャレンジ支援貸付: 0,
  };

  it.each([
    { kind: 'benefit', title: configData.result.benefitDescription },
    { kind: 'loan', title: configData.result.loanDescription },
  ] as const)('renders no $kind section', async ({ kind, title }) => {
    const screen = await mount('chiyoda', { kind }, zeroAmounts);
    expect(page.getByText(title).query()).toBeNull();
    expect(page.getByRole('button').query()).toBeNull();
    expect(screen.container.textContent).toBe('');
  });
});
