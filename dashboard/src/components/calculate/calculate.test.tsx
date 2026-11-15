// @vitest-environment jsdom
import { ReactNode } from 'react';
import { act, cleanup, renderHook } from '@testing-library/react';
import { RecoilRoot, snapshot_UNSTABLE, useSetRecoilState } from 'recoil';
import { afterEach, describe, expect, it } from 'vitest';
import {
  currentDateAtom,
  frontendHouseholdAtom,
  FrontendHousehold,
  householdAtom,
} from '../../state';
import { calculateFrontendHouseHold } from './calculate';

const date = '2026-01-15';
const nextDate = '2026-02-15';
const nationalInsurance =
  '健康保険・年金の減免制度（国民健康保険に加入している場合）';
const nationalPension =
  '健康保険・年金の減免制度（国民年金に加入している場合）';
const employeeInsurance =
  '健康保険・年金の減免制度（共済組合、協会けんぽまたは健康保険組合に加入している場合）';

// These are candidate programs, not a determination of benefit eligibility.
// Keep the expected names explicit and independent of the calculation code.
const concernPrograms: Record<string, string[]> = {
  仕事について: [
    '雇用保険（失業手当）',
    '求職者支援制度（職業訓練・ハロートレーニング）',
    '住宅支援（住居確保給付金）',
    nationalInsurance,
    nationalPension,
    '自立相談支援機関による相談支援',
  ],
  妊娠について: [
    '妊婦健診の助成',
    '産前産後休業（産休）',
    '低所得世帯向けの入院助産制度',
    nationalInsurance,
    nationalPension,
    employeeInsurance,
  ],
  出産や子育てについて: [
    '出産育児一時金（国民健康保険に加入している場合）',
    '出産育児一時金（共済組合、協会けんぽまたは健康保険組合に加入している場合）',
    '出産手当金（会社員・公務員向け）',
    '育児休業給付金',
    '高額療養費制度（国民健康保険に加入している場合）',
    '高額療養費制度（共済組合、協会けんぽまたは健康保険組合に加入している場合）',
    nationalInsurance,
    nationalPension,
    employeeInsurance,
    'ひとり親家庭等医療費助成',
    '未熟児養育医療費助成',
    '小児慢性特定疾患医療費助成',
  ],
  進学について: ['給付型奨学金'],
  介護について: [
    '介護保険制度',
    '介護休業制度',
    '介護保険料の減免',
    '老人介護手当',
    '介護保険サービス利用者負担助成金',
  ],
  入院について: [
    '高額療養費制度（国民健康保険に加入している場合）',
    '高額療養費制度（共済組合、協会けんぽまたは健康保険組合に加入している場合）',
    '医療費控除（確定申告）',
  ],
  病気や障害について: [
    '身体障害者手帳・療育手帳・精神障害者保健福祉手帳',
    '自立支援医療',
    '重度障害者医療費助成',
    '指定難病医療給付制度',
    '障がい者向けの就労支援',
  ],
  離婚について: [
    'ひとり親家庭等医療費助成',
    '養育費に関する公正証書等の作成費用補助',
    '子どものための養育費相談',
  ],
};
const fujimiPrograms: Record<string, string[]> = {
  妊娠について: ['富士見市出産・子育て応援給付金'],
  出産や子育てについて: [
    '富士見市産後ケア事業',
    '富士見市こども医療費助成',
    '富士見市出産・子育て応援給付金',
  ],
};
const saitamaEducation = [
  '埼玉県母子寡婦福祉資金貸付金',
  '埼玉県私立学校の父母負担軽減',
];

const freshHousehold = (concerns: string[], previous = false) => {
  const household = structuredClone(
    snapshot_UNSTABLE().getLoadable(frontendHouseholdAtom).getValue()
  );
  for (const name of Object.keys(household.困りごと)) {
    household.困りごと[name] = concerns.includes(name);
  }
  for (const name of Object.keys(household.制度)) {
    household.制度[name] = previous;
  }
  return household;
};

const wrapperFor = (prefecture: string, city: string) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <RecoilRoot
        initializeState={({ set }) => {
          set(currentDateAtom, date);
          set(householdAtom, {
            世帯一覧: {
              世帯1: {
                居住都道府県: { [date]: prefecture, [nextDate]: '埼玉県' },
                居住市区町村: { [date]: city, [nextDate]: '富士見市' },
              },
            },
          });
        }}
      >
        {children}
      </RecoilRoot>
    );
  };

const expectPrograms = (household: FrontendHousehold, enabled: string[]) => {
  const allPrograms = Object.keys(freshHousehold([]).制度);
  expect(household.制度).toEqual(
    Object.fromEntries(
      allPrograms.map((name) => [name, enabled.includes(name)])
    )
  );
  // Also catch misspelled expected program names.
  expect(
    Object.keys(household.制度)
      .filter((name) => household.制度[name])
      .sort()
  ).toEqual([...new Set(enabled)].sort());
};

afterEach(cleanup);

describe.each([
  ['東京都', '千代田区'],
  ['埼玉県', 'さいたま市'],
  ['埼玉県', '富士見市'],
])('frontend candidate programs in %s %s', (prefecture, city) => {
  it.each(Object.entries(concernPrograms))(
    '%s enables only the relevant programs and clears previous results',
    (concern, programs) => {
      const input = freshHousehold([concern], true);
      const { result } = renderHook(() => calculateFrontendHouseHold(input), {
        wrapper: wrapperFor(prefecture, city),
      });
      const local =
        prefecture === '埼玉県' && city === '富士見市'
          ? fujimiPrograms[concern] ?? []
          : [];
      const prefectural =
        prefecture === '埼玉県' && concern === '進学について'
          ? saitamaEducation
          : [];
      expectPrograms(result.current, [...programs, ...local, ...prefectural]);
      expect(result.current.困りごと).toEqual(
        freshHousehold([concern]).困りごと
      );
    }
  );
});

it('clears every previous program when no concerns are selected', () => {
  const { result } = renderHook(
    () => calculateFrontendHouseHold(freshHousehold([], true)),
    { wrapper: wrapperFor('埼玉県', '富士見市') }
  );
  expectPrograms(result.current, []);
});

it('combines concerns and removes their old programs on recalculation', () => {
  const { result, rerender } = renderHook(
    (input: FrontendHousehold) => calculateFrontendHouseHold(input),
    {
      initialProps: freshHousehold(['妊娠について', '出産や子育てについて']),
      wrapper: wrapperFor('埼玉県', '富士見市'),
    }
  );
  expectPrograms(result.current, [
    ...concernPrograms.妊娠について,
    ...concernPrograms.出産や子育てについて,
    ...fujimiPrograms.妊娠について,
    ...fujimiPrograms.出産や子育てについて,
  ]);
  const next = {
    ...result.current,
    困りごと: freshHousehold(['仕事について']).困りごと,
  };
  rerender(next);
  expectPrograms(result.current, concernPrograms.仕事について);
  rerender({ ...result.current, 困りごと: freshHousehold([]).困りごと });
  expectPrograms(result.current, []);
});

it('uses the residence at the selected Recoil date and removes old local programs', () => {
  const input = freshHousehold(['妊娠について', '進学について']);
  const { result } = renderHook(
    () => ({
      household: calculateFrontendHouseHold(input),
      setDate: useSetRecoilState(currentDateAtom),
    }),
    { wrapper: wrapperFor('東京都', '千代田区') }
  );
  const national = [
    ...concernPrograms.妊娠について,
    ...concernPrograms.進学について,
  ];
  expectPrograms(result.current.household, national);
  act(() => result.current.setDate(nextDate));
  expectPrograms(result.current.household, [
    ...national,
    ...fujimiPrograms.妊娠について,
    ...saitamaEducation,
  ]);
  act(() => result.current.setDate(date));
  expectPrograms(result.current.household, national);
});
