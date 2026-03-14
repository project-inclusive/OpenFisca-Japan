// 質問の型（どのテンプレートを使用するか）

import { HouseholdMemberAttrs } from './household';

// NOTE: テンプレート生成のための設定値なのでas constでreadonlyにする
export const addressQuestionDefinitions = {
  住んでいる場所: {
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
  家を借りたい: {
    type: 'Boolean',
  },
} as const;

export const personNumQuestionDefinitions = {
  子どもの人数: {
    type: 'PersonNum',
  },
} as const;

export const selectionQuestionDefinitions = {
  仕事: {
    type: 'Selection',
    selections: ['会社員', '公務員', '自営業', 'その他'],
  },
} as const;

export const questionDefinitions = {
  ...addressQuestionDefinitions,
  ...ageQuestionDefinitions,
  ...amountOfMoneyQuestionDefinitions,
  ...booleanQuestionDefinitions,
  //  ...personNumQuestionDefinitions,
  ...selectionQuestionDefinitions,
} as const;

export type AddressQuestionKey = keyof typeof addressQuestionDefinitions;
export type AgeQuestionKey = keyof typeof ageQuestionDefinitions;
export type AmountOfMoneyQuestionKey =
  keyof typeof amountOfMoneyQuestionDefinitions;
export type BooleanQuestionKey = keyof typeof booleanQuestionDefinitions;
export type PersonNumQuestionKey = keyof typeof personNumQuestionDefinitions;
export type SelectionQuestionKey = keyof typeof selectionQuestionDefinitions;
export type QuestionKey =
  | AddressQuestionKey
  | AgeQuestionKey
  | AmountOfMoneyQuestionKey
  | BooleanQuestionKey
  //  | PersonNumQuestionKey
  | SelectionQuestionKey;

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

/*
export const isPersonNumQuestion = (
  key: QuestionKey
): key is PersonNumQuestionKey => {
  return personNumQuestionKeys.includes(key as any);
};
*/

export const isSelectionQuestion = (
  key: QuestionKey
): key is SelectionQuestionKey => {
  return selectionQuestionKeys.includes(key as any);
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
  // 質問Tの選択肢のunion型
  selection:
    | (typeof selectionQuestionDefinitions)[T]['selections'][number]
    | undefined;
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

export type QuestionAnswer = addressQuestionAnswer &
  ageQuestionAnswer &
  amountOfMoneyQuestionAnswer &
  booleanQuestionAnswer &
  //  personNumQuestionAnswer &
  selectionQuestionAnswer;

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

export type QuestionAnswers = addressQuestionAnswers &
  ageQuestionAnswers &
  amountOfMoneyQuestionAnswers &
  booleanQuestionAnswers &
  //  personNumQuestionAnswers &
  selectionQuestionAnswers;
