import { test, expect } from 'vitest';
import { Actor, createActor } from 'xstate';
import { questionStateMachine } from './questionState';
import { QuestionKey } from './questionDefinition';

// stateの準備をするためのヘルパー関数
// 特定のstateまでの遷移を毎回定義すると冗長なので、この関数で共通化
const skipUntil = (
  actor: Actor<typeof questionStateMachine>,
  until: QuestionKey
) => {
  const sendFuncs: {
    key: QuestionKey;
    f: () => void;
  }[] = [
    {
      key: '住んでいる場所',
      f: () => {
        actor.send({
          type: '住んでいる場所',
          value: {
            type: 'Address',
            prefecure: '東京都',
            municipality: '渋谷区',
          },
        });
      },
    },
    {
      key: '年齢',
      f: () => {
        actor.send({
          type: '年齢',
          value: { type: 'Age', selection: 10 },
        });
      },
    },
    {
      key: '年収',
      f: () => {
        actor.send({
          type: '年収',
          value: { type: 'AmountOfMoney', selection: 0, unit: '万円' },
        });
      },
    },
  ];

  for (const sendFunc of sendFuncs) {
    if (sendFunc.key === until) {
      return;
    }
    sendFunc.f();
    actor.send({ type: 'next' });
  }
};

test('あなた: 住んでいる場所: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();

  actor.send({
    type: '住んでいる場所',
    value: { type: 'Address', prefecure: '東京都', municipality: '渋谷区' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().context['住んでいる場所']['あなた'][0]).toEqual({
    type: 'Address',
    prefecure: '東京都',
    municipality: '渋谷区',
  });
});

test('あなた: 住んでいる場所: 次の質問が「年齢」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();

  actor.send({
    type: '住んでいる場所',
    value: { type: 'Address', prefecure: '東京都', municipality: '渋谷区' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('年齢');
});

test('あなた: 住んでいる場所: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();

  actor.send({
    type: '住んでいる場所',
    value: { type: 'Address', prefecure: '東京都', municipality: '渋谷区' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('住んでいる場所');
  expect(actor.getSnapshot().context['住んでいる場所']['あなた'][0]).toEqual({
    type: 'Address',
    prefecure: '東京都',
    municipality: '渋谷区',
  });
});

test('あなた: 年齢: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '年齢');

  actor.send({
    type: '年齢',
    value: { type: 'Age', selection: 20 },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().context['年齢']['あなた'][0]).toEqual({
    type: 'Age',
    selection: 20,
  });
});

test('あなた: 年齢: 次の質問が「年収」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '年齢');

  actor.send({
    type: '年齢',
    value: { type: 'Age', selection: 20 },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('年収');
});

test('あなた: 年齢: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '年齢');

  actor.send({
    type: '年齢',
    value: { type: 'Age', selection: 20 },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('年齢');
  expect(actor.getSnapshot().context['年齢']['あなた'][0]).toEqual({
    type: 'Age',
    selection: 20,
  });
});

test('あなた: 年収: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '年収');

  actor.send({
    type: '年収',
    value: { type: 'AmountOfMoney', selection: 300, unit: '万円' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().context['年収']['あなた'][0]).toEqual({
    type: 'AmountOfMoney',
    selection: 300,
    unit: '万円',
  });
});

test('あなた: 年収: 次の質問が「仕事」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '年収');

  actor.send({
    type: '年収',
    value: { type: 'AmountOfMoney', selection: 300, unit: '万円' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('預貯金');
});

test('あなた: 年齢: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '年収');

  actor.send({
    type: '年収',
    value: { type: 'AmountOfMoney', selection: 300, unit: '万円' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('年収');
  expect(actor.getSnapshot().context['年収']['あなた'][0]).toEqual({
    type: 'AmountOfMoney',
    selection: 300,
    unit: '万円',
  });
});

test('あなた: 預貯金: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '預貯金');

  actor.send({
    type: '預貯金',
    value: { type: 'AmountOfMoney', selection: 300, unit: '万円' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().context['預貯金']['あなた'][0]).toEqual({
    type: 'AmountOfMoney',
    selection: 300,
    unit: '万円',
  });
});

test('あなた: 預貯金: 次の質問が「仕事」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '預貯金');

  actor.send({
    type: '預貯金',
    value: { type: 'AmountOfMoney', selection: 300, unit: '万円' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('仕事');
});

test('あなた: 預貯金: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '預貯金');

  actor.send({
    type: '預貯金',
    value: { type: 'AmountOfMoney', selection: 300, unit: '万円' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('預貯金');
  expect(actor.getSnapshot().context['預貯金']['あなた'][0]).toEqual({
    type: 'AmountOfMoney',
    selection: 300,
    unit: '万円',
  });
});

// TODO: 本実装時にすべての状態遷移とassignをテスト
