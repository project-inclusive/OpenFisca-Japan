// 質問の型（どのテンプレートを使用するか）

import { HouseholdMemberAttrs } from './household';

// NOTE: テンプレート生成のための設定値なのでas constでreadonlyにする
export const addressQuestionDefinitions = {
  寝泊まりしている地域: {
    type: 'Address',
    // 選択肢は都道府県市区町村.jsonから取得
  },
} as const;

export const ageQuestionDefinitions = {
  年齢: {
    type: 'Age',
  },
} as const;

export const amountOfMoneyQuestionDefinitions = {
  年収: {
    type: 'AmountOfMoney',
  },
  預貯金: {
    type: 'AmountOfMoney',
  },
} as const;

export const booleanQuestionDefinitions = {
  '家を借りたいですか？': { type: 'Boolean' },
  '現在仕事をしていますか？': { type: 'Boolean' },
  '6か月以内に新しい仕事を始めましたか？': { type: 'Boolean' },
  '休職中ですか？': { type: 'Boolean' },
  '休職中に給与の支払いがない状態ですか？': { type: 'Boolean' },
  '入院中ですか？': { type: 'Boolean' },
  '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？': {
    type: 'Boolean',
  },
  '感染症にかかっていますか？': { type: 'Boolean' },
  'HIVに感染していますか？': { type: 'Boolean' },
  'エイズを発症していますか？': { type: 'Boolean' },
  '家族に血液製剤によってHIVに感染した方はいますか？': { type: 'Boolean' },
  '血液製剤の投与によってHIVに感染しましたか？': { type: 'Boolean' },
  'C型肝炎に感染していますか？': { type: 'Boolean' },
  '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？': {
    type: 'Boolean',
  },
  '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？': {
    type: 'Boolean',
  },
  '腎不全ですか？': { type: 'Boolean' },
  '慢性腎不全ですか？': { type: 'Boolean' },
  '人工透析を行っていますか？': { type: 'Boolean' },
  '先天性の血液凝固因子異常症（血友病等）ですか？': { type: 'Boolean' },
  '内部障害（内臓などのからだの内部の障害）がありますか？': { type: 'Boolean' },
  '脳性まひ、または進行性筋萎縮症ですか？': { type: 'Boolean' },
  '介護施設に入所していますか？': { type: 'Boolean' },
  '高校、大学、専門学校、職業訓練学校等の学生ですか？': { type: 'Boolean' },
  '配偶者はいますか？': { type: 'Boolean' },
  '以下のいずれかに当てはまりますか？': { type: 'Boolean' },
  '高校に通っていますか？': { type: 'Boolean' },
} as const;

export const personNumQuestionDefinitions = {
  子どもの人数: { type: 'PersonNum' },
  親の人数: { type: 'PersonNum' },
} as const;

export const selectionQuestionDefinitions = {
  仕事: {
    type: 'Selection',
    selections: ['会社員', '公務員', '自営業', 'その他'],
  },
  '通っている高校の種類を選んでください（1）': {
    type: 'Selection',
    selections: ['全日制課程', '定時制課程', '通信制課程', '専攻科'],
  },
  '通っている高校の種類を選んでください（2）': {
    type: 'Selection',
    selections: ['国立', '公立', '私立'],
  },
  '身体障害者手帳を持っていますか？': {
    type: 'Selection',
    selections: ['1級', '2級', '3級', '上記以外／持っていない'],
  },
  '精神障害者保健福祉手帳を持っていますか？': {
    type: 'Selection',
    selections: ['1級', '2級', '3級', '上記以外／持っていない'],
  },
  '療育手帳、または愛の手帳を持っていますか？': {
    type: 'Selection',
    selections: [
      '療育手帳 A',
      '療育手帳 B',
      '愛の手帳 1度',
      '愛の手帳 2度',
      '愛の手帳 3度',
      '愛の手帳 4度',
      '上記以外／持っていない',
    ],
  },
  '放射線障害がありますか？': {
    type: 'Selection',
    selections: ['現罹患者', '元罹患者', 'いいえ'],
  },
  '妊娠中、または産後6ヵ月以内ですか？': {
    type: 'Selection',
    selections: ['妊娠6ヵ月未満', '妊娠6ヵ月以上', '産後6ヵ月以内', 'いいえ'],
  },
} as const;

export const multipleSelectionQuestionDefinitions = {
  '病気やけが、障害はありますか？': {
    type: 'MultipleSelection',
    selections: ['病気がある', 'けがをしている', '障害がある'],
  },
  '業務によって病気やけがをしましたか？': {
    type: 'MultipleSelection',
    selections: ['業務によって病気になった', '業務によってけがをした'],
  },
  '病気やけがによって連続3日以上休業していますか？': {
    type: 'MultipleSelection',
    selections: [
      '病気によって連続三日以上休業している',
      'けがによって連続三日以上休業している',
    ],
  },
  '血液凝固因子異常症のうち、当てはまるものはどれですか？': {
    type: 'MultipleSelection',
    selections: [
      '第I因子（フィブリノゲン）欠乏症',
      '第II因子（プロトロンビン）欠乏症',
      '第V因子（不安定因子）欠乏症',
      '第VII因子（安定因子）欠乏症',
      '第VIII因子欠乏症（血友病A）',
      '第IX因子欠乏症（血友病B）',
      '第X因子（スチュアートプラウア）欠乏症',
      '第XI因子（PTA）欠乏症',
      '第XII因子（ヘイグマン因子）欠乏症',
      '第XIII因子（フィブリン安定化因子）欠乏症',
      'Von Willebrand（フォン・ヴィルブランド）病',
      'わからない・その他',
    ],
  },
  '困りごとはありますか？': {
    type: 'MultipleSelection',
    selections: [
      '仕事について',
      '妊娠について',
      '出産や子育てについて',
      '進学について',
      '介護について',
      '入院について',
      '病気や障害について',
      '離婚について',
    ],
  },
} as const;

export const questionDefinitions = {
  ...addressQuestionDefinitions,
  ...ageQuestionDefinitions,
  ...amountOfMoneyQuestionDefinitions,
  ...booleanQuestionDefinitions,
  ...personNumQuestionDefinitions,
  ...selectionQuestionDefinitions,
  ...multipleSelectionQuestionDefinitions,
} as const;

export type AddressQuestionKey = keyof typeof addressQuestionDefinitions;
export type AgeQuestionKey = keyof typeof ageQuestionDefinitions;
export type AmountOfMoneyQuestionKey =
  keyof typeof amountOfMoneyQuestionDefinitions;
export type BooleanQuestionKey = keyof typeof booleanQuestionDefinitions;
export type PersonNumQuestionKey = keyof typeof personNumQuestionDefinitions;
export type SelectionQuestionKey = keyof typeof selectionQuestionDefinitions;
export type MultipleSelectionQuestionKey =
  keyof typeof multipleSelectionQuestionDefinitions;
export type QuestionKey =
  | AddressQuestionKey
  | AgeQuestionKey
  | AmountOfMoneyQuestionKey
  | BooleanQuestionKey
  | PersonNumQuestionKey
  | SelectionQuestionKey
  | MultipleSelectionQuestionKey;

export const addressQuestionKeys = Object.keys(
  addressQuestionDefinitions
) as AddressQuestionKey[];
export const ageQuestionKeys = Object.keys(
  ageQuestionDefinitions
) as AgeQuestionKey[];
export const amountOfMoneyQuestionKeys = Object.keys(
  amountOfMoneyQuestionDefinitions
) as AmountOfMoneyQuestionKey[];
export const booleanQuestionKeys = Object.keys(
  booleanQuestionDefinitions
) as BooleanQuestionKey[];
export const personNumQuestionKeys = Object.keys(
  personNumQuestionDefinitions
) as PersonNumQuestionKey[];
export const selectionQuestionKeys = Object.keys(
  selectionQuestionDefinitions
) as SelectionQuestionKey[];
export const multipleSelectionQuestionKeys = Object.keys(
  multipleSelectionQuestionDefinitions
) as MultipleSelectionQuestionKey[];
export const questionKeys = Object.keys(questionDefinitions) as QuestionKey[];

export const isAddressQuestion = (
  key: QuestionKey
): key is AddressQuestionKey => {
  return addressQuestionKeys.includes(key as any);
};

export const isAgeQuestion = (key: QuestionKey): key is AgeQuestionKey => {
  return ageQuestionKeys.includes(key as any);
};

export const isAmountOfMoneyQuestion = (
  key: QuestionKey
): key is AmountOfMoneyQuestionKey => {
  return amountOfMoneyQuestionKeys.includes(key as any);
};

export const isBooleanQuestion = (
  key: QuestionKey
): key is BooleanQuestionKey => {
  return booleanQuestionKeys.includes(key as any);
};

export const isPersonNumQuestion = (
  key: QuestionKey
): key is PersonNumQuestionKey => {
  return personNumQuestionKeys.includes(key as any);
};

export const isSelectionQuestion = (
  key: QuestionKey
): key is SelectionQuestionKey => {
  return selectionQuestionKeys.includes(key as any);
};

export const isMultipleSelectionQuestion = (
  key: QuestionKey
): key is MultipleSelectionQuestionKey => {
  return multipleSelectionQuestionKeys.includes(key as any);
};

// 質問の型定義
export type AddressQuestion = {
  type: 'Address';
  prefecure: string;
  municipality: string;
};

export type AgeQuestion = {
  type: 'Age';
  selection: number | undefined;
};

export type AmountOfMoneyQuestion = {
  type: 'AmountOfMoney';
  selection: number | undefined;
  // 金額の単位（数値変換する際に使用）
  unit: '万円';
};

export type BooleanQuestion = {
  type: 'Boolean';
  selection: boolean | undefined;
};

export type PersonNumQuestion = {
  type: 'PersonNum';
  selection: number | undefined;
};

export type SelectionQuestion<T extends SelectionQuestionKey> = {
  type: 'Selection';
  selection:
    | (typeof selectionQuestionDefinitions)[T]['selections'][number]
    | undefined;
};

export type MultipleSelectionQuestion<T extends MultipleSelectionQuestionKey> =
  {
    type: 'MultipleSelection';
    selection: (typeof multipleSelectionQuestionDefinitions)[T]['selections'][number][];
  };

// 質問の回答を表す型
type addressQuestionAnswer = {
  [_ in keyof typeof addressQuestionDefinitions]: AddressQuestion;
};

type ageQuestionAnswer = {
  [_ in keyof typeof ageQuestionDefinitions]: AgeQuestion;
};

type amountOfMoneyQuestionAnswer = {
  [_ in keyof typeof amountOfMoneyQuestionDefinitions]: AmountOfMoneyQuestion;
};

type booleanQuestionAnswer = {
  [_ in keyof typeof booleanQuestionDefinitions]: BooleanQuestion;
};

type personNumQuestionAnswer = {
  [_ in keyof typeof personNumQuestionDefinitions]: PersonNumQuestion;
};

type selectionQuestionAnswer = {
  [K in keyof typeof selectionQuestionDefinitions]: SelectionQuestion<K>;
};

type multipleSelectionQuestionAnswer = {
  [K in keyof typeof multipleSelectionQuestionDefinitions]: MultipleSelectionQuestion<K>;
};

export type QuestionAnswer = addressQuestionAnswer &
  ageQuestionAnswer &
  amountOfMoneyQuestionAnswer &
  booleanQuestionAnswer &
  personNumQuestionAnswer &
  selectionQuestionAnswer &
  multipleSelectionQuestionAnswer;

// 各世帯員に対する回答をまとめた型
// HACK: xstateのassignの仕様上直下のキーを質問名にする必要があるため、answers[質問][続柄][index]の形式で定義
// (householdは[世帯員][質問]の形式なので注意！)
type addressQuestionAnswers = {
  [_ in keyof typeof addressQuestionDefinitions]: HouseholdMemberAttrs<AddressQuestion>;
};

type ageQuestionAnswers = {
  [_ in keyof typeof ageQuestionDefinitions]: HouseholdMemberAttrs<AgeQuestion>;
};

type amountOfMoneyQuestionAnswers = {
  [_ in keyof typeof amountOfMoneyQuestionDefinitions]: HouseholdMemberAttrs<AmountOfMoneyQuestion>;
};

type booleanQuestionAnswers = {
  [_ in keyof typeof booleanQuestionDefinitions]: HouseholdMemberAttrs<BooleanQuestion>;
};

type personNumQuestionAnswers = {
  [_ in keyof typeof personNumQuestionDefinitions]: HouseholdMemberAttrs<PersonNumQuestion>;
};

type selectionQuestionAnswers = {
  [K in keyof typeof selectionQuestionDefinitions]: HouseholdMemberAttrs<
    SelectionQuestion<K>
  >;
};

type multipleSelectionQuestionAnswers = {
  [K in keyof typeof multipleSelectionQuestionDefinitions]: HouseholdMemberAttrs<
    MultipleSelectionQuestion<K>
  >;
};

export type QuestionAnswers = addressQuestionAnswers &
  ageQuestionAnswers &
  amountOfMoneyQuestionAnswers &
  booleanQuestionAnswers &
  personNumQuestionAnswers &
  selectionQuestionAnswers &
  multipleSelectionQuestionAnswers;
