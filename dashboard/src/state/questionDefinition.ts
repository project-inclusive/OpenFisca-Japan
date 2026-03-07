// 質問の型（どのテンプレートを使用するか）

import { HouseholdMemberAttrs } from './household';

// NOTE: テンプレート生成のための設定値なのでas constでreadonlyにする
export const addressQuestionDefinitions = {
  住んでいる場所: {
    type: 'Address',
    // 選択肢は都道府県市区町村.jsonから取得
  },
} as const;

export const booleanQuestionDefinitions = {
  家を借りたい: {
    type: 'Boolean',
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
  ...booleanQuestionDefinitions,
  ...selectionQuestionDefinitions,
} as const;

export type AddressQuestionKey = keyof typeof addressQuestionDefinitions;
export type BooleanQuestionKey = keyof typeof booleanQuestionDefinitions;
export type SelectionQuestionKey = keyof typeof selectionQuestionDefinitions;
export type QuestionKey =
  | AddressQuestionKey
  | BooleanQuestionKey
  | SelectionQuestionKey;

export const addressQuestionKeys = Object.keys(
  addressQuestionDefinitions
) as AddressQuestionKey[];
export const booleanQuestionKeys = Object.keys(
  booleanQuestionDefinitions
) as BooleanQuestionKey[];
export const selectionQuestionKeys = Object.keys(
  selectionQuestionDefinitions
) as SelectionQuestionKey[];
export const questionKeys = Object.keys(questionDefinitions) as QuestionKey[];

export const isAddressQuestion = (
  key: QuestionKey
): key is AddressQuestionKey => {
  return addressQuestionKeys.includes(key as any);
};

export const isBooleanQuestion = (
  key: QuestionKey
): key is BooleanQuestionKey => {
  return booleanQuestionKeys.includes(key as any);
};

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

export type BooleanQuestion = {
  type: 'Boolean';
  selection: boolean | undefined;
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

type booleanQuestionAnswer = {
  [_ in keyof typeof booleanQuestionDefinitions]: BooleanQuestion;
};

type selectionQuestionAnswer = {
  [K in keyof typeof selectionQuestionDefinitions]: SelectionQuestion<K>;
};

export type QuestionAnswer = addressQuestionAnswer &
  booleanQuestionAnswer &
  selectionQuestionAnswer;

// 各世帯員に対する回答をまとめた型
// HACK: xstateのassignの仕様上直下のキーを質問名にする必要があるため、answers[質問][続柄][index]の形式で定義
// (householdは[世帯員][質問]の形式なので注意！)
type addressQuestionAnswers = {
  [_ in keyof typeof addressQuestionDefinitions]: HouseholdMemberAttrs<AddressQuestion>;
};

type booleanQuestionAnswers = {
  [_ in keyof typeof booleanQuestionDefinitions]: HouseholdMemberAttrs<BooleanQuestion>;
};

type selectionQuestionAnswers = {
  [K in keyof typeof selectionQuestionDefinitions]: HouseholdMemberAttrs<
    SelectionQuestion<K>
  >;
};

export type QuestionAnswers = addressQuestionAnswers &
  booleanQuestionAnswers &
  selectionQuestionAnswers;
