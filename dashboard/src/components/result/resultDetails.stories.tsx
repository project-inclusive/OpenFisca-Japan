import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import configData from '../../config/app_config.json';
import {
  ResultDetailsTestPage,
  calculationResult,
  googleMapsUrl,
  hepatitisCStudy,
} from '../../mocks/resultDetailsTestUtils';

const meta = {
  title: 'Results/Details',
  component: ResultDetailsTestPage,
  args: {
    result: calculationResult({ residence: 'fujimi' }),
    view: { kind: 'benefit' },
  },
} satisfies Meta<typeof ResultDetailsTestPage>;
export default meta;
type Story = StoryObj<typeof meta>;
type Canvas = Parameters<NonNullable<Story['play']>>[0]['canvas'];
type UserEvent = Parameters<NonNullable<Story['play']>>[0]['userEvent'];

const benefits = configData.result.給付制度.制度一覧;
const livingSupport =
  configData.result.貸付制度.生活福祉資金貸付制度.制度一覧.生活支援費;

// Accordion buttons in display order, identified by their accessible names.
const expectButtons = async (canvas: Canvas, names: string[]) => {
  for (const name of names) {
    await expect(await canvas.findByRole('button', { name })).toBeVisible();
  }
  const buttons = canvas.getAllByRole('button');
  await expect(buttons).toHaveLength(names.length);
  await expect(
    names.map((name) => buttons.indexOf(canvas.getByRole('button', { name })))
  ).toEqual(names.map((_, index) => index));
};

const openPanel = async (
  canvas: Canvas,
  userEvent: UserEvent,
  name: string
) => {
  await userEvent.click(await canvas.findByRole('button', { name }));
  const panel = await canvas.findByRole('region', { name });
  // The panel fades in from zero opacity, which toBeVisible treats as hidden.
  await waitFor(() => expect(panel).toBeVisible());
  return within(panel);
};

const expectHelpDesk = async (
  scope: Pick<Canvas, 'findByRole' | 'getByRole'>,
  desk: { 施設名: string; 所在地: string; 電話番号: string; url: string }
) => {
  await expect(
    await scope.findByRole('link', { name: desk.施設名 })
  ).toHaveAttribute('href', desk.url);
  await expect(
    await scope.findByRole('link', { name: '地図を開く' })
  ).toHaveAttribute('href', googleMapsUrl(desk.施設名, desk.所在地));
  await expect(
    await scope.findByRole('link', { name: desk.電話番号 })
  ).toHaveAttribute('href', `tel:${desk.電話番号}`);
};

export const BenefitAmounts: Story = {
  args: {
    result: calculationResult({
      residence: 'fujimi',
      amounts: {
        児童手当: 15000,
        児童扶養手当_最小: 10000,
        児童扶養手当_最大: 45000,
        特別児童扶養手当_最小: 0,
        特別児童扶養手当_最大: 53700,
        生活保護: 123456,
        傷病手当金: 4321,
        災害弔慰金: 5000000,
        // Zero amounts are not offered.
        障害基礎年金: 0,
        特別障害者手当_最小: 0,
        特別障害者手当_最大: 0,
      },
    }),
    view: { kind: 'benefit' },
  },
  play: async ({ canvas, userEvent }) => {
    await expect(
      await canvas.findByText(configData.result.benefitDescription)
    ).toBeVisible();
    await expect(
      await canvas.findByText(configData.result.給付制度.caption[0])
    ).toBeVisible();
    // Sorted by the maximum amount, floored to 0.1 万円, keeping each unit.
    await expectButtons(canvas, [
      '傷病手当金 0.4 万円/日',
      '児童手当 1.5 万円/月',
      '児童扶養手当 1~4.5 万円/月',
      '特別児童扶養手当 0~5.3 万円/月',
      '生活保護 12.3 万円/月',
      '災害弔慰金 500 万円',
    ]);

    const childAllowance = await openPanel(
      canvas,
      userEvent,
      '児童手当 1.5 万円/月'
    );
    await expect(
      await childAllowance.findByText(benefits.児童手当.caption[0])
    ).toBeVisible();
    await expect(
      await childAllowance.findByRole('link', { name: '詳細リンク' })
    ).toHaveAttribute('href', benefits.児童手当.reference);
    await expectHelpDesk(childAllowance, {
      施設名: '富士見市役所 子育て支援課 手当医療グループ',
      所在地: '埼玉県富士見市大字鶴馬1800-1',
      電話番号: '049-252-7104',
      url: 'https://www.city.fujimi.saitama.jp/shisei/10soshiki/kodomomirai/19kosodate.html',
    });

    // A program without a configured help desk shows only its description.
    const condolence = await openPanel(
      canvas,
      userEvent,
      '災害弔慰金 500 万円'
    );
    await expect(
      await condolence.findByRole('link', { name: '詳細リンク' })
    ).toHaveAttribute('href', benefits.災害弔慰金.reference);
    await expect(
      condolence.queryByRole('link', { name: '地図を開く' })
    ).not.toBeInTheDocument();
  },
};

const sendaiMedicalCenter = {
  施設名: '独立行政法人国立病院機構仙台医療センター',
  所在地: '宮城県仙台市宮城野区宮城野２－１１－１２',
  電話番号: '022-293-1111',
  url: 'https://nsmc.hosp.go.jp/',
};
const hivAmounts = { [hepatitisCStudy]: 10000, 健康管理費用: 20000 };
const hepatitisCButton = `${hepatitisCStudy} 1 万円/月`;
const hospitalDescription =
  configData.result.helpDeskDescription.拠点病院.description1;

const checkHivHelpDesk =
  (shown: boolean): NonNullable<Story['play']> =>
  async ({ canvas, userEvent }) => {
    await expectButtons(canvas, [hepatitisCButton, '健康管理費用 2 万円/月']);
    // This program always shows its base hospitals.
    const healthCare = await openPanel(
      canvas,
      userEvent,
      '健康管理費用 2 万円/月'
    );
    await expect(
      await healthCare.findByText(hospitalDescription)
    ).toBeVisible();
    await expectHelpDesk(healthCare, sendaiMedicalCenter);

    const study = await openPanel(canvas, userEvent, hepatitisCButton);
    await expect(
      await study.findByText(benefits[hepatitisCStudy].caption[0])
    ).toBeVisible();
    if (shown) {
      await expect(await study.findByText(hospitalDescription)).toBeVisible();
      await expectHelpDesk(study, sendaiMedicalCenter);
    } else {
      await expect(
        study.queryByText(hospitalDescription)
      ).not.toBeInTheDocument();
      await expect(
        study.queryByRole('link', { name: '地図を開く' })
      ).not.toBeInTheDocument();
    }
  };

export const BenefitHivPositive: Story = {
  args: {
    result: calculationResult({
      residence: 'sendai',
      amounts: hivAmounts,
      hiv: true,
    }),
    view: { kind: 'benefit' },
  },
  play: checkHivHelpDesk(true),
};
export const BenefitHivNegative: Story = {
  args: {
    result: calculationResult({
      residence: 'sendai',
      amounts: hivAmounts,
      hiv: false,
    }),
    view: { kind: 'benefit' },
  },
  play: checkHivHelpDesk(false),
};
export const BenefitHivUnanswered: Story = {
  args: {
    result: calculationResult({ residence: 'sendai', amounts: hivAmounts }),
    view: { kind: 'benefit' },
  },
  play: checkHivHelpDesk(false),
};

export const LoanUnits: Story = {
  args: {
    result: calculationResult({
      residence: 'chiyoda',
      amounts: {
        生活支援費: 150000,
        緊急小口資金: 200000,
        受験生チャレンジ支援貸付: 123456,
        // Zero amounts are not offered.
        教育支援費: 0,
        災害援護資金: 0,
      },
    }),
    view: { kind: 'loan' },
  },
  play: async ({ canvas, userEvent }) => {
    await expect(
      await canvas.findByText(configData.result.loanDescription)
    ).toBeVisible();
    await expect(await canvas.findByText('生活福祉資金貸付制度')).toBeVisible();
    await expect(await canvas.findByText('その他')).toBeVisible();
    // Loans show an upper limit, floored to 0.1 万円, with a monthly or
    // one-off unit. Categories keep the configured order.
    await expectButtons(canvas, [
      '生活支援費 ~15 万円/月',
      '緊急小口資金 ~20 万円',
      '受験生チャレンジ支援貸付 ~12.3 万円',
    ]);
    // The welfare fund category introduces the local social welfare council.
    await expectHelpDesk(canvas, {
      施設名: '千代田区社会福祉協議会',
      所在地: '東京都千代田区九段南１−６−１０かがやきプラザ４階',
      電話番号: '03-3265-1901',
      url: 'https://www.chiyoda-cosw.jp/',
    });
    const living = await openPanel(canvas, userEvent, '生活支援費 ~15 万円/月');
    await expect(
      await living.findByText(livingSupport.caption[1])
    ).toBeVisible();
    await expect(
      await living.findByRole('link', { name: '詳細リンク' })
    ).toHaveAttribute('href', livingSupport.reference);
  },
};

export const LoanOtherOnly: Story = {
  args: {
    result: calculationResult({
      residence: 'chiyoda',
      amounts: { 災害援護資金: 1500000 },
    }),
    view: { kind: 'loan' },
  },
  play: async ({ canvas }) => {
    await expectButtons(canvas, ['災害援護資金 ~150 万円']);
    await expect(await canvas.findByText('その他')).toBeVisible();
    await expect(
      canvas.queryByText('生活福祉資金貸付制度')
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('link', { name: '千代田区社会福祉協議会' })
    ).not.toBeInTheDocument();
  },
};

// Prefectural hospitals come first; regional hospitals follow.
export const BaseHospitalsTokyo: Story = {
  args: {
    result: calculationResult({ residence: 'chiyoda' }),
    view: { kind: 'helpDesk', name: 'baseHospital' },
  },
  play: async ({ canvas }) => {
    await expect(await canvas.findByText(hospitalDescription)).toBeVisible();
    const names = [
      '慶應義塾大学病院',
      '東京慈恵会医科大学附属病院',
      '都立駒込病院',
      '新潟市民病院',
      '新潟大学医歯学総合病院',
      '新潟県立新発田病院',
    ];
    for (const name of names) {
      await expect(await canvas.findByRole('link', { name })).toBeVisible();
    }
    const links = canvas.getAllByRole('link');
    const positions = names.map((name) =>
      links.indexOf(canvas.getByRole('link', { name }))
    );
    await expect(positions).toEqual([...positions].sort((a, b) => a - b));
    await expect(
      canvas.getAllByRole('link', { name: '地図を開く' })
    ).toHaveLength(names.length);
  },
};

// Sendai's hospital is both the prefectural and the regional one.
export const BaseHospitalsWithoutDuplicates: Story = {
  args: {
    result: calculationResult({ residence: 'sendai' }),
    view: { kind: 'helpDesk', name: 'baseHospital' },
  },
  play: async ({ canvas }) => {
    await expectHelpDesk(canvas, sendaiMedicalCenter);
    await expect(
      canvas.getAllByRole('link', { name: sendaiMedicalCenter.施設名 })
    ).toHaveLength(1);
  },
};

export const HelpDeskWithNote: Story = {
  args: {
    result: calculationResult({ residence: 'fujimi' }),
    view: { kind: 'helpDesk', name: 'intractableDisease' },
  },
  play: async ({ canvas }) => {
    await expectHelpDesk(canvas, {
      施設名: '埼玉県朝霞保健所',
      所在地: '埼玉県朝霞市青葉台1-10-5',
      電話番号: '048-461-0468',
      url: 'https://www.pref.saitama.lg.jp/a0705/tokuteisikkan/sinki.html',
    });
    await expect(
      await canvas.findByText(
        '申請を受けたい場合、リンク先の「新規申請の手続」をご覧ください。'
      )
    ).toBeVisible();
  },
};
