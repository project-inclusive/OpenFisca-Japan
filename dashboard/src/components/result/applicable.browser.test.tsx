import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { cleanup, render } from 'vitest-browser-react';
import { currentDateAtom, householdAtom } from '../../state';
import { TestProviders } from '../questions/template/questionTemplateTestUtils';
import {
  calculationResult,
  CalculationResult,
  Residence,
} from '../../mocks/resultDetailsTestUtils';
import { calculationDate } from '../../mocks/calculateFixtures';
import { calculateFrontendHouseHold } from '../calculate/calculate';
import { Applicable } from './applicable';

afterEach(async () => cleanup());

const button = (name: string) =>
  page.getByRole('button', { name, exact: true });
const link = (name: string) => page.getByRole('link', { name, exact: true });
const visible = (locator: ReturnType<typeof button>) =>
  expect.poll(() => locator.query()?.checkVisibility()).toBe(true);
const front = (...names: string[]) => ({
  世帯員: {},
  世帯: {},
  困りごと: {},
  制度: Object.fromEntries(names.map((name) => [name, true])),
});

const View = ({
  result,
  frontend = front(),
  residence = 'fujimi',
}: {
  result?: CalculationResult;
  frontend?: ReturnType<typeof front>;
  residence?: Residence;
}) => (
  <TestProviders
    initializeState={({ set }) => {
      set(currentDateAtom, calculationDate);
      set(householdAtom, calculationResult({ residence }));
    }}
  >
    <Applicable result={result} frontendHouseholdResult={frontend} />
  </TestProviders>
);

const open = async (name: string) => {
  await visible(button(name));
  await button(name).click();
  await expect.element(button(name)).toHaveAttribute('aria-expanded', 'true');
};

it('renders calculated work programs, their explanations and the configured desk', async () => {
  const backend = calculationResult({ residence: 'fujimi' });
  const CalculatedView = () => {
    const frontend = calculateFrontendHouseHold({
      ...front(),
      困りごと: { 仕事について: true },
    });
    return <Applicable result={backend} frontendHouseholdResult={frontend} />;
  };
  await render(
    <TestProviders
      initializeState={({ set }) => {
        set(currentDateAtom, calculationDate);
        set(householdAtom, structuredClone(backend));
      }}
    >
      <CalculatedView />
    </TestProviders>
  );
  for (const name of [
    '雇用保険（失業手当）',
    '求職者支援制度（職業訓練・ハロートレーニング）',
    '住宅支援（住居確保給付金）',
    '健康保険・年金の減免制度（国民健康保険に加入している場合）',
    '健康保険・年金の減免制度（国民年金に加入している場合）',
    '自立相談支援機関による相談支援',
  ]) {
    await visible(button(name));
  }
  await expect.poll(() => page.getByRole('button').all().length).toBe(6);
  await open('雇用保険（失業手当）');
  await visible(
    page.getByText(
      '労働者の生活及び雇用の安定と就職の促進のために、失業された方や教育訓練を受けられる方等に対して、失業等給付を支給します。',
      { exact: true }
    )
  );
  await visible(link('ハローワーク川越'));
  await expect
    .element(link('ハローワーク川越'))
    .toHaveAttribute(
      'href',
      'https://jsite.mhlw.go.jp/saitama-hellowork/list/kawagoe.html'
    );
  // This program has a desk but no reference URL.
  expect(link('詳細リンク').query()).toBeNull();
});

it('shows a reference and explanation without a desk when none is configured', async () => {
  await render(
    <View
      result={calculationResult({ residence: 'fujimi' })}
      frontend={front('産前産後休業（産休）')}
    />
  );
  await open('産前産後休業（産休）');
  await visible(
    page.getByText('母体保護のため労働基準法で定められた休業制度です。')
  );
  await visible(link('詳細リンク'));
  await expect
    .element(link('詳細リンク'))
    .toHaveAttribute(
      'href',
      'https://www.bosei-navi.mhlw.go.jp/ninshin/sanzen_sango.html'
    );
  await expect.element(link('詳細リンク')).toHaveAttribute('target', '_blank');
  expect(link('地図を開く').query()).toBeNull();
  expect(page.getByText('TEL:', { exact: true }).query()).toBeNull();
});

it('merges backend and frontend programs, hides false/unknown values and avoids duplicates', async () => {
  const result = calculationResult({
    residence: 'fujimi',
    amounts: {
      特定疾病療養の対象者がいる: 1,
      '雇用保険（失業手当）': 1,
      重度心身障害者医療費助成制度の対象者がいる: 0,
      未登録の制度: 1,
    },
  });
  const frontend = front(
    '雇用保険（失業手当）',
    '給付型奨学金',
    '未登録の制度'
  );
  frontend.制度['介護休業制度'] = false;
  await render(<View result={result} frontend={frontend} />);
  for (const name of ['特定疾病療養', '雇用保険（失業手当）', '給付型奨学金']) {
    await visible(button(name));
  }
  await expect.poll(() => page.getByRole('button').all().length).toBe(3);
  expect(button('重度心身障害者医療費助成').query()).toBeNull();
  expect(button('介護休業制度').query()).toBeNull();
  expect(button('未登録の制度').query()).toBeNull();
});

it.each([undefined, calculationResult({ residence: 'fujimi' })])(
  'hides the section without applicable results (%j)',
  async (result) => {
    const screen = await render(<View result={result} />);
    await expect.poll(() => screen.container.textContent).toBe('');
  }
);

describe('special disease help desk', () => {
  it.each(['missing', 'negative', 'positive member', 'positive spouse'])(
    'shows HIV hospital contacts only for a positive household member (%s)',
    async (scenario) => {
      const result = calculationResult({
        residence: 'sendai',
        amounts: { 特定疾病療養の対象者がいる: 1 },
        hiv:
          scenario === 'missing' ? undefined : scenario === 'positive member',
      });
      if (scenario === 'positive spouse') {
        result.世帯員.配偶者 = { HIV感染者である: { [calculationDate]: true } };
      }
      await render(<View result={result} residence="sendai" />);
      await open('特定疾病療養');
      await visible(
        page.getByText(
          '長期間の治療と高額な医療費が必要な病気に対して医療費の負担を減らす制度。'
        )
      );
      if (scenario.startsWith('positive')) {
        await visible(link('独立行政法人国立病院機構仙台医療センター'));
      } else {
        expect(
          link('独立行政法人国立病院機構仙台医療センター').query()
        ).toBeNull();
        expect(link('地図を開く').query()).toBeNull();
      }
    }
  );
});

it.each(['fujimi', 'chiyoda'] as const)(
  'gates the private-school desk using the result prefecture (%s)',
  async (residence) => {
    // Keep a supported saved household address for both cases. Otherwise the
    // desk's own address filter could mask a broken Applicable prefecture gate.
    await render(
      <View
        result={calculationResult({ residence })}
        frontend={front('埼玉県私立学校の父母負担軽減')}
      />
    );
    await open('埼玉県私立学校の父母負担軽減');
    await visible(link('詳細リンク'));
    const desk = link('埼玉県庁 総務部 学事課 高等学校担当');
    if (residence === 'fujimi') {
      await visible(desk);
      await expect
        .element(desk)
        .toHaveAttribute(
          'href',
          'https://www.pref.saitama.lg.jp/a0204/fubofutan2.html'
        );
    } else {
      expect(desk.query()).toBeNull();
      expect(link('地図を開く').query()).toBeNull();
    }
  }
);

it('replaces displayed programs when a new calculation result arrives', async () => {
  const screen = await render(
    <View
      result={calculationResult({ residence: 'fujimi' })}
      frontend={front('雇用保険（失業手当）')}
    />
  );
  await visible(button('雇用保険（失業手当）'));
  await screen.rerender(
    <View
      result={calculationResult({ residence: 'fujimi' })}
      frontend={front('給付型奨学金')}
    />
  );
  await visible(button('給付型奨学金'));
  expect(button('雇用保険（失業手当）').query()).toBeNull();
  await screen.rerender(
    <View result={calculationResult({ residence: 'fujimi' })} />
  );
  await expect.poll(() => screen.container.textContent).toBe('');
});

// The frontend result is an input to the displayed list, even when the backend
// response object stays the same. Keep the intended behavior as a known failure.
it.fails(
  'refreshes programs when only the frontend calculation changes',
  async () => {
    const result = calculationResult({ residence: 'fujimi' });
    const screen = await render(
      <View result={result} frontend={front('雇用保険（失業手当）')} />
    );
    await visible(button('雇用保険（失業手当）'));
    await screen.rerender(
      <View result={result} frontend={front('給付型奨学金')} />
    );
    await visible(button('給付型奨学金'));
    expect(button('雇用保険（失業手当）').query()).toBeNull();
  }
);
