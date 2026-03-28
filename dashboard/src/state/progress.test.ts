import { test, expect } from 'vitest';
import { calculateProgress, maxProgressOf } from './progress';
import { createActor } from 'xstate';
import { questionStateMachine } from './questionState';

const detailedQuestionMaxProgress = maxProgressOf('くわしく見積もり');

// くわしく見積もり

test('くわしく見積もり: あなたの最初の質問の時点で進捗は0', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  actor.send({
    type: '見積もりモード',
    value: {
      type: 'Selection',
      selection: 'くわしく見積もり',
    },
  });
  actor.send({ type: 'next' });

  const actual = calculateProgress(
    actor.getSnapshot().context,
    actor.getSnapshot().value,
    detailedQuestionMaxProgress
  );
  expect(actual).toBe(0);
});

test('くわしく見積もり: 配偶者の最初の質問の時点で進捗は0.6以上', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  actor.send({
    type: '見積もりモード',
    value: {
      type: 'Selection',
      selection: 'くわしく見積もり',
    },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '寝泊まりしている地域',
    value: { type: 'Address', prefecure: '東京都', municipality: '新宿区' },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '年齢',
    value: { type: 'Age', selection: 10 },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '年収',
    value: { type: 'AmountOfMoney', selection: 0, unit: '万円' },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '預貯金',
    value: { type: 'AmountOfMoney', selection: 0, unit: '万円' },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '現在仕事をしていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: [],
    },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '介護施設に入所していますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '家を借りたいですか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '妊娠中、または産後6ヵ月以内ですか？',
    value: { type: 'Selection', selection: 'いいえ' },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '困りごとはありますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '配偶者はいますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });

  const actual = calculateProgress(
    actor.getSnapshot().context,
    actor.getSnapshot().value,
    detailedQuestionMaxProgress
  );
  expect(actual).greaterThan(0.6);
});

test('くわしく見積もり: 1人目の子どもの人数の質問の時点で進捗は0.8', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  actor.send({
    type: '見積もりモード',
    value: {
      type: 'Selection',
      selection: 'くわしく見積もり',
    },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '寝泊まりしている地域',
    value: { type: 'Address', prefecure: '東京都', municipality: '新宿区' },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '年齢',
    value: { type: 'Age', selection: 10 },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '年収',
    value: { type: 'AmountOfMoney', selection: 0, unit: '万円' },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '預貯金',
    value: { type: 'AmountOfMoney', selection: 0, unit: '万円' },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '現在仕事をしていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: [],
    },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '介護施設に入所していますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '家を借りたいですか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '妊娠中、または産後6ヵ月以内ですか？',
    value: { type: 'Selection', selection: 'いいえ' },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '困りごとはありますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '配偶者はいますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });

  const actual = calculateProgress(
    actor.getSnapshot().context,
    actor.getSnapshot().value,
    detailedQuestionMaxProgress
  );
  expect(actual).toBe(0.8);
});

test('くわしく見積もり: 1人目の子どもの最初の質問の時点で進捗は0.8以上', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  actor.send({
    type: '見積もりモード',
    value: {
      type: 'Selection',
      selection: 'くわしく見積もり',
    },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '寝泊まりしている地域',
    value: { type: 'Address', prefecure: '東京都', municipality: '新宿区' },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '年齢',
    value: { type: 'Age', selection: 10 },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '年収',
    value: { type: 'AmountOfMoney', selection: 0, unit: '万円' },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '預貯金',
    value: { type: 'AmountOfMoney', selection: 0, unit: '万円' },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '現在仕事をしていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: [],
    },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '介護施設に入所していますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '家を借りたいですか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '妊娠中、または産後6ヵ月以内ですか？',
    value: { type: 'Selection', selection: 'いいえ' },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '困りごとはありますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '配偶者はいますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '子どもの人数',
    value: { type: 'PersonNum', selection: 1 },
  });
  actor.send({ type: 'next' });

  const actual = calculateProgress(
    actor.getSnapshot().context,
    actor.getSnapshot().value,
    detailedQuestionMaxProgress
  );
  expect(actual).greaterThan(0.8);
});

test('くわしく見積もり: 1人目の親の人数の質問の時点で進捗は0.9', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  actor.send({
    type: '見積もりモード',
    value: {
      type: 'Selection',
      selection: 'くわしく見積もり',
    },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '寝泊まりしている地域',
    value: { type: 'Address', prefecure: '東京都', municipality: '新宿区' },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '年齢',
    value: { type: 'Age', selection: 10 },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '年収',
    value: { type: 'AmountOfMoney', selection: 0, unit: '万円' },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '預貯金',
    value: { type: 'AmountOfMoney', selection: 0, unit: '万円' },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '現在仕事をしていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: [],
    },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '介護施設に入所していますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '家を借りたいですか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '妊娠中、または産後6ヵ月以内ですか？',
    value: { type: 'Selection', selection: 'いいえ' },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '困りごとはありますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '配偶者はいますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '子どもの人数',
    value: { type: 'PersonNum', selection: 0 },
  });
  actor.send({ type: 'next' });

  const actual = calculateProgress(
    actor.getSnapshot().context,
    actor.getSnapshot().value,
    detailedQuestionMaxProgress
  );
  expect(actual).toBe(0.9);
});

test('くわしく見積もり: 1人目の親の最初の質問の時点で進捗は0.9以上', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  actor.send({
    type: '見積もりモード',
    value: {
      type: 'Selection',
      selection: 'くわしく見積もり',
    },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '寝泊まりしている地域',
    value: { type: 'Address', prefecure: '東京都', municipality: '新宿区' },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '年齢',
    value: { type: 'Age', selection: 10 },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '年収',
    value: { type: 'AmountOfMoney', selection: 0, unit: '万円' },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '預貯金',
    value: { type: 'AmountOfMoney', selection: 0, unit: '万円' },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '現在仕事をしていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: [],
    },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '介護施設に入所していますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '家を借りたいですか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '妊娠中、または産後6ヵ月以内ですか？',
    value: { type: 'Selection', selection: 'いいえ' },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '困りごとはありますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '配偶者はいますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '子どもの人数',
    value: { type: 'PersonNum', selection: 0 },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '親の人数',
    value: { type: 'PersonNum', selection: 1 },
  });
  actor.send({ type: 'next' });

  const actual = calculateProgress(
    actor.getSnapshot().context,
    actor.getSnapshot().value,
    detailedQuestionMaxProgress
  );
  expect(actual).greaterThan(0.9);
});

// かんたん見積もり

test('かんたん見積もり: あなたの最初の質問の時点で進捗は0', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  actor.send({
    type: '見積もりモード',
    value: {
      type: 'Selection',
      selection: 'かんたん見積もり',
    },
  });
  actor.send({ type: 'next' });

  const actual = calculateProgress(
    actor.getSnapshot().context,
    actor.getSnapshot().value,
    detailedQuestionMaxProgress
  );
  expect(actual).toBe(0);
});

test('かんたん見積もり: 配偶者の最初の質問の時点で進捗は0.6以上', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  actor.send({
    type: '見積もりモード',
    value: {
      type: 'Selection',
      selection: 'かんたん見積もり',
    },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '寝泊まりしている地域',
    value: {
      type: 'Address',
      prefecure: '東京都',
      municipality: '渋谷区',
    },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '年収',
    value: { type: 'AmountOfMoney', selection: 0, unit: '万円' },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '配偶者はいますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });

  const actual = calculateProgress(
    actor.getSnapshot().context,
    actor.getSnapshot().value,
    detailedQuestionMaxProgress
  );
  expect(actual).greaterThan(0.6);
});

test('かんたん見積もり: 1人目の子どもの最初の質問の時点で進捗は0.8以上', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  actor.send({
    type: '見積もりモード',
    value: {
      type: 'Selection',
      selection: 'かんたん見積もり',
    },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '寝泊まりしている地域',
    value: {
      type: 'Address',
      prefecure: '東京都',
      municipality: '渋谷区',
    },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '年収',
    value: { type: 'AmountOfMoney', selection: 0, unit: '万円' },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '配偶者はいますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '子どもの人数',
    value: { type: 'PersonNum', selection: 1 },
  });
  actor.send({ type: 'next' });

  const actual = calculateProgress(
    actor.getSnapshot().context,
    actor.getSnapshot().value,
    detailedQuestionMaxProgress
  );
  expect(actual).greaterThan(0.8);
});

// 災害支援見積もり

test('災害支援見積もり: あなたの最初の質問の時点で進捗は0', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  actor.send({
    type: '見積もりモード',
    value: {
      type: 'Selection',
      selection: '能登半島地震被災者支援制度見積もり',
    },
  });
  actor.send({ type: 'next' });

  const actual = calculateProgress(
    actor.getSnapshot().context,
    actor.getSnapshot().value,
    detailedQuestionMaxProgress
  );
  expect(actual).toBe(0);
});

test('災害支援見積もり: 配偶者の最初の質問の時点で進捗は0.6以上', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  actor.send({
    type: '見積もりモード',
    value: {
      type: 'Selection',
      selection: '能登半島地震被災者支援制度見積もり',
    },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '寝泊まりしている地域',
    value: { type: 'Address', prefecure: '東京都', municipality: '新宿区' },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '年齢',
    value: { type: 'Age', selection: 10 },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '被災前の年収',
    value: { type: 'AmountOfMoney', selection: 0, unit: '万円' },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '住宅が被害を受けていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '家財の３分の１以上の損害が発生しましたか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '災害により負傷し、1ヶ月以上療養を続けていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '災害によって、精神または身体に重い障害がありますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '家族に災害で亡くなった方はいますか？',
    value: { type: 'PersonNum', selection: 0 },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '配偶者はいますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });

  const actual = calculateProgress(
    actor.getSnapshot().context,
    actor.getSnapshot().value,
    detailedQuestionMaxProgress
  );
  expect(actual).greaterThan(0.6);
});

test('災害支援見積もり: 1人目の子どもの最初の質問の時点で進捗は0.8以上', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  actor.send({
    type: '見積もりモード',
    value: {
      type: 'Selection',
      selection: '能登半島地震被災者支援制度見積もり',
    },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '寝泊まりしている地域',
    value: { type: 'Address', prefecure: '東京都', municipality: '新宿区' },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '年齢',
    value: { type: 'Age', selection: 10 },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '被災前の年収',
    value: { type: 'AmountOfMoney', selection: 0, unit: '万円' },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '住宅が被害を受けていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '家財の３分の１以上の損害が発生しましたか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '災害により負傷し、1ヶ月以上療養を続けていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '災害によって、精神または身体に重い障害がありますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '家族に災害で亡くなった方はいますか？',
    value: { type: 'PersonNum', selection: 0 },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '配偶者はいますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '子どもの人数',
    value: { type: 'PersonNum', selection: 1 },
  });
  actor.send({ type: 'next' });

  const actual = calculateProgress(
    actor.getSnapshot().context,
    actor.getSnapshot().value,
    detailedQuestionMaxProgress
  );
  expect(actual).greaterThan(0.8);
});

test('災害支援見積もり: 1人目の親の最初の質問の時点で進捗は0.9以上', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  actor.send({
    type: '見積もりモード',
    value: {
      type: 'Selection',
      selection: '能登半島地震被災者支援制度見積もり',
    },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '寝泊まりしている地域',
    value: { type: 'Address', prefecure: '東京都', municipality: '新宿区' },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '年齢',
    value: { type: 'Age', selection: 10 },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '被災前の年収',
    value: { type: 'AmountOfMoney', selection: 0, unit: '万円' },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '住宅が被害を受けていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '家財の３分の１以上の損害が発生しましたか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '災害により負傷し、1ヶ月以上療養を続けていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '災害によって、精神または身体に重い障害がありますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '家族に災害で亡くなった方はいますか？',
    value: { type: 'PersonNum', selection: 0 },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '配偶者はいますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '子どもの人数',
    value: { type: 'PersonNum', selection: 0 },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '親の人数',
    value: { type: 'PersonNum', selection: 1 },
  });
  actor.send({ type: 'next' });

  const actual = calculateProgress(
    actor.getSnapshot().context,
    actor.getSnapshot().value,
    detailedQuestionMaxProgress
  );
  expect(actual).greaterThan(0.9);
});
