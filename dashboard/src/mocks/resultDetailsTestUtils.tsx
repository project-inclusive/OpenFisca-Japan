import { currentDateAtom, householdAtom } from '../state';
import { TestProviders } from '../components/questions/template/questionTemplateTestUtils';
import { Benefit } from '../components/result/benefit';
import { Loan } from '../components/result/loan';
import { HelpDesk } from '../components/result/helpDesk';
import { calculationDate } from './calculateFixtures';

// Synthetic calculation results for display branches, not assertions about
// eligibility. Amounts are in yen; the components display them in 万円.
export const residences = {
  // Every municipal help desk in the config is defined for this city.
  fujimi: ['埼玉県', '富士見市'],
  // Has a social welfare council entry, but no municipal help desks.
  chiyoda: ['東京都', '千代田区'],
  // The prefecture has data, but the city does not.
  saitamaCity: ['埼玉県', 'さいたま市'],
  // The prefecture has no social welfare council data at all.
  sapporo: ['北海道', '札幌市'],
  // The prefectural and regional base hospital lists share one hospital.
  sendai: ['宮城県', '仙台市'],
  // These entries store the facility name in the website URL field.
  hamura: ['東京都', '羽村市'],
  toshima: ['東京都', '利島村'],
} as const satisfies Record<string, readonly [string, string]>;
export type Residence = keyof typeof residences;

export type CalculationResult = ReturnType<typeof calculationResult>;

export const calculationResult = ({
  residence,
  amounts = {},
  hiv,
}: {
  residence: Residence;
  amounts?: Record<string, number>;
  // undefined: the member has no HIV field at all.
  hiv?: boolean;
}) => {
  const at = <T,>(value: T) => ({ [calculationDate]: value });
  const [prefecture, city] = residences[residence];
  return {
    世帯員: {
      あなた: hiv === undefined ? {} : { HIV感染者である: at(hiv) },
      配偶者: {},
    },
    世帯一覧: {
      世帯1: {
        親一覧: ['あなた', '配偶者'],
        居住都道府県: at(prefecture),
        居住市区町村: at(city),
        ...Object.fromEntries(
          Object.entries(amounts).map(([name, amount]) => [name, at(amount)])
        ),
      },
    },
  };
};

export type ResultDetailsView =
  | { kind: 'benefit' }
  | { kind: 'loan' }
  | { kind: 'helpDesk'; name: string };

// Shared by Storybook and Vitest Browser Mode. The result also serves as the
// household, because help desks read the residence from the household.
export const ResultDetailsTestPage = ({
  result,
  view,
}: {
  result: CalculationResult;
  view: ResultDetailsView;
}) => (
  <TestProviders
    initializeState={({ set }) => {
      set(currentDateAtom, calculationDate);
      // Clone so the result passed to the components is not shared with Recoil.
      set(householdAtom, structuredClone(result));
    }}
  >
    {view.kind === 'benefit' && <Benefit result={result} />}
    {view.kind === 'loan' && <Loan result={result} />}
    {view.kind === 'helpDesk' && <HelpDesk name={view.name} />}
  </TestProviders>
);

export const googleMapsUrl = (name: string, address: string) =>
  encodeURI(`https://www.google.com/maps/search/${name}+${address}`);

// Long program name that only shows its help desk to HIV-positive households.
export const hepatitisCStudy =
  '先天性の傷病治療によるC型肝炎患者に係るQOL向上等のための調査研究事業';
