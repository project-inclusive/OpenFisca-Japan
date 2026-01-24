import { test, expect } from 'vitest';
import { createActor } from 'xstate';
import { questionStateMachine } from './questionState';

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

test('あなた: 住んでいる場所: 次の質問が「仕事」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();

  actor.send({
    type: '住んでいる場所',
    value: { type: 'Address', prefecure: '東京都', municipality: '渋谷区' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('仕事');
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

// TODO: 本実装時にすべての状態遷移とassignをテスト
