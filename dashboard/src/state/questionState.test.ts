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
      key: '寝泊まりしている地域',
      f: () => {
        actor.send({
          type: '寝泊まりしている地域',
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
    {
      key: '預貯金',
      f: () => {
        actor.send({
          type: '預貯金',
          value: { type: 'AmountOfMoney', selection: 0, unit: '万円' },
        });
      },
    },
    {
      key: '現在仕事をしていますか？',
      f: () => {
        actor.send({
          type: '現在仕事をしていますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '仕事',
      f: () => {
        actor.send({
          type: '仕事',
          value: { type: 'Selection', selection: '会社員' },
        });
      },
    },
    {
      key: '6か月以内に新しい仕事を始めましたか？',
      f: () => {
        actor.send({
          type: '6か月以内に新しい仕事を始めましたか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '休職中ですか？',
      f: () => {
        actor.send({
          type: '休職中ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '休職中に給与の支払いがない状態ですか？',
      f: () => {
        actor.send({
          type: '休職中に給与の支払いがない状態ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '病気やけが、障害はありますか？',
      f: () => {
        actor.send({
          type: '病気やけが、障害はありますか？',
          value: {
            type: 'MultipleSelection',
            selection: ['病気がある', '障害がある'],
          },
        });
      },
    },
    {
      key: '業務によって病気やけがをしましたか？',
      f: () => {
        actor.send({
          type: '業務によって病気やけがをしましたか？',
          value: { type: 'MultipleSelection', selection: [] },
        });
      },
    },
    {
      key: '病気やけがによって連続3日以上休業していますか？',
      f: () => {
        actor.send({
          type: '病気やけがによって連続3日以上休業していますか？',
          value: { type: 'MultipleSelection', selection: [] },
        });
      },
    },
    {
      key: '入院中ですか？',
      f: () => {
        actor.send({
          type: '入院中ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
      f: () => {
        actor.send({
          type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '感染症にかかっていますか？',
      f: () => {
        actor.send({
          type: '感染症にかかっていますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: 'HIVに感染していますか？',
      f: () => {
        actor.send({
          type: 'HIVに感染していますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: 'エイズを発症していますか？',
      f: () => {
        actor.send({
          type: 'エイズを発症していますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '家族に血液製剤によってHIVに感染した方はいますか？',
      f: () => {
        actor.send({
          type: '家族に血液製剤によってHIVに感染した方はいますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '血液製剤の投与によってHIVに感染しましたか？',
      f: () => {
        actor.send({
          type: '血液製剤の投与によってHIVに感染しましたか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: 'C型肝炎に感染していますか？',
      f: () => {
        actor.send({
          type: 'C型肝炎に感染していますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？',
      f: () => {
        actor.send({
          type: '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？',
      f: () => {
        actor.send({
          type: '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '腎不全ですか？',
      f: () => {
        actor.send({
          type: '腎不全ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '慢性腎不全ですか？',
      f: () => {
        actor.send({
          type: '慢性腎不全ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '人工透析を行っていますか？',
      f: () => {
        actor.send({
          type: '人工透析を行っていますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '先天性の血液凝固因子異常症（血友病等）ですか？',
      f: () => {
        actor.send({
          type: '先天性の血液凝固因子異常症（血友病等）ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '血液凝固因子異常症のうち、当てはまるものはどれですか？',
      f: () => {
        actor.send({
          type: '血液凝固因子異常症のうち、当てはまるものはどれですか？',
          value: { type: 'MultipleSelection', selection: [] },
        });
      },
    },
    {
      key: '身体障害者手帳を持っていますか？',
      f: () => {
        actor.send({
          type: '身体障害者手帳を持っていますか？',
          value: { type: 'Selection', selection: '上記以外／持っていない' },
        });
      },
    },
    {
      key: '精神障害者保健福祉手帳を持っていますか？',
      f: () => {
        actor.send({
          type: '精神障害者保健福祉手帳を持っていますか？',
          value: { type: 'Selection', selection: '上記以外／持っていない' },
        });
      },
    },
    {
      key: '療育手帳、または愛の手帳を持っていますか？',
      f: () => {
        actor.send({
          type: '療育手帳、または愛の手帳を持っていますか？',
          value: { type: 'Selection', selection: '上記以外／持っていない' },
        });
      },
    },
    {
      key: '放射線障害がありますか？',
      f: () => {
        actor.send({
          type: '放射線障害がありますか？',
          value: { type: 'Selection', selection: 'いいえ' },
        });
      },
    },
    {
      key: '内部障害（内臓などのからだの内部の障害）がありますか？',
      f: () => {
        actor.send({
          type: '内部障害（内臓などのからだの内部の障害）がありますか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '脳性まひ、または進行性筋萎縮症ですか？',
      f: () => {
        actor.send({
          type: '脳性まひ、または進行性筋萎縮症ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '介護施設に入所していますか？',
      f: () => {
        actor.send({
          type: '介護施設に入所していますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
      f: () => {
        actor.send({
          type: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '家を借りたいですか？',
      f: () => {
        actor.send({
          type: '家を借りたいですか？',
          value: { type: 'Boolean', selection: true },
        });
      },
    },
    {
      key: '妊娠中、または産後6ヵ月以内ですか？',
      f: () => {
        actor.send({
          type: '妊娠中、または産後6ヵ月以内ですか？',
          value: { type: 'Selection', selection: '妊娠6ヵ月未満' },
        });
      },
    },
    {
      key: '困りごとはありますか？',
      f: () => {
        actor.send({
          type: '困りごとはありますか？',
          value: { type: 'MultipleSelection', selection: [] },
        });
      },
    },
    {
      key: '配偶者はいますか？',
      f: () => {
        actor.send({
          type: '配偶者はいますか？',
          value: { type: 'Boolean', selection: false },
        });
      },
    },
    {
      key: '子どもの人数',
      f: () => {
        actor.send({
          type: '子どもの人数',
          value: { type: 'PersonNum', selection: 0 },
        });
      },
    },
    {
      key: '親の人数',
      f: () => {
        actor.send({
          type: '親の人数',
          value: { type: 'PersonNum', selection: 0 },
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

test('あなた: 寝泊まりしている地域: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();

  actor.send({
    type: '寝泊まりしている地域',
    value: { type: 'Address', prefecure: '東京都', municipality: '渋谷区' },
  });
  expect(
    actor.getSnapshot().context['寝泊まりしている地域']['あなた'][0]
  ).toEqual({
    type: 'Address',
    prefecure: '東京都',
    municipality: '渋谷区',
  });
});

test('あなた: 寝泊まりしている地域: 次の質問が「年齢」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();

  actor.send({
    type: '寝泊まりしている地域',
    value: { type: 'Address', prefecure: '東京都', municipality: '渋谷区' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('年齢');
});

test('あなた: 寝泊まりしている地域: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();

  actor.send({
    type: '寝泊まりしている地域',
    value: { type: 'Address', prefecure: '東京都', municipality: '渋谷区' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('寝泊まりしている地域');
  expect(
    actor.getSnapshot().context['寝泊まりしている地域']['あなた'][0]
  ).toEqual({
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
  expect(actor.getSnapshot().context['年収']['あなた'][0]).toEqual({
    type: 'AmountOfMoney',
    selection: 300,
    unit: '万円',
  });
});

test('あなた: 年収: 次の質問が「預貯金」', () => {
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

test('あなた: 年収: next->backで元の質問に戻る', () => {
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
  expect(actor.getSnapshot().context['預貯金']['あなた'][0]).toEqual({
    type: 'AmountOfMoney',
    selection: 300,
    unit: '万円',
  });
});

test('あなた: 預貯金: 次の質問が「現在仕事をしていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '預貯金');

  actor.send({
    type: '預貯金',
    value: { type: 'AmountOfMoney', selection: 300, unit: '万円' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('現在仕事をしていますか？');
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

test('あなた: 現在仕事をしていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '現在仕事をしていますか？');

  actor.send({
    type: '現在仕事をしていますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['現在仕事をしていますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 現在仕事をしていますか？: 次の質問が「仕事」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '現在仕事をしていますか？');

  actor.send({
    type: '現在仕事をしていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('仕事');
});

test('あなた: 現在仕事をしていますか？: falseの場合次の質問が「病気やけが、障害はありますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '現在仕事をしていますか？');

  actor.send({
    type: '現在仕事をしていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('病気やけが、障害はありますか？');
});

test('あなた: 現在仕事をしていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '現在仕事をしていますか？');

  actor.send({
    type: '現在仕事をしていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('現在仕事をしていますか？');
  expect(
    actor.getSnapshot().context['現在仕事をしていますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: false,
  });
});

test('あなた: 仕事: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '仕事');

  actor.send({
    type: '仕事',
    value: { type: 'Selection', selection: '会社員' },
  });
  expect(actor.getSnapshot().context['仕事']['あなた'][0]).toEqual({
    type: 'Selection',
    selection: '会社員',
  });
});

test('あなた: 仕事: 次の質問が「6か月以内に新しい仕事を始めましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '仕事');

  actor.send({
    type: '仕事',
    value: { type: 'Selection', selection: '会社員' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '6か月以内に新しい仕事を始めましたか？'
  );
});

test('あなた: 仕事: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '仕事');

  actor.send({
    type: '仕事',
    value: { type: 'Selection', selection: '会社員' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('仕事');
  expect(actor.getSnapshot().context['仕事']['あなた'][0]).toEqual({
    type: 'Selection',
    selection: '会社員',
  });
});

test('あなた: 6か月以内に新しい仕事を始めましたか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '6か月以内に新しい仕事を始めましたか？');

  actor.send({
    type: '6か月以内に新しい仕事を始めましたか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['6か月以内に新しい仕事を始めましたか？'][
      'あなた'
    ][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 6か月以内に新しい仕事を始めましたか？: 次の質問が「休職中ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '6か月以内に新しい仕事を始めましたか？');

  actor.send({
    type: '6か月以内に新しい仕事を始めましたか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('休職中ですか？');
});

test('あなた: 6か月以内に新しい仕事を始めましたか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '6か月以内に新しい仕事を始めましたか？');

  actor.send({
    type: '6か月以内に新しい仕事を始めましたか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '6か月以内に新しい仕事を始めましたか？'
  );
  expect(
    actor.getSnapshot().context['6か月以内に新しい仕事を始めましたか？'][
      'あなた'
    ][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 休職中ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '休職中ですか？');

  actor.send({
    type: '休職中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(actor.getSnapshot().context['休職中ですか？']['あなた'][0]).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 休職中ですか？: 次の質問が「休職中に給与の支払いがない状態ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '休職中ですか？');

  actor.send({
    type: '休職中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '休職中に給与の支払いがない状態ですか？'
  );
});

test('あなた: 休職中ですか？: falseの場合次の質問が「病気やけが、障害はありますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '休職中ですか？');

  actor.send({
    type: '休職中ですか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('病気やけが、障害はありますか？');
});

test('あなた: 休職中ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '休職中ですか？');

  actor.send({
    type: '休職中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('休職中ですか？');
  expect(actor.getSnapshot().context['休職中ですか？']['あなた'][0]).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 休職中に給与の支払いがない状態ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '休職中に給与の支払いがない状態ですか？');

  actor.send({
    type: '休職中に給与の支払いがない状態ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['休職中に給与の支払いがない状態ですか？'][
      'あなた'
    ][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 休職中に給与の支払いがない状態ですか？: 次の質問が「病気やけが、障害はありますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '休職中に給与の支払いがない状態ですか？');

  actor.send({
    type: '休職中に給与の支払いがない状態ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('病気やけが、障害はありますか？');
});

test('あなた: 休職中に給与の支払いがない状態ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '休職中に給与の支払いがない状態ですか？');

  actor.send({
    type: '休職中に給与の支払いがない状態ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '休職中に給与の支払いがない状態ですか？'
  );
  expect(
    actor.getSnapshot().context['休職中に給与の支払いがない状態ですか？'][
      'あなた'
    ][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 病気やけが、障害はありますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['病気がある', '障害がある'],
    },
  });
  expect(
    actor.getSnapshot().context['病気やけが、障害はありますか？']['あなた'][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: ['病気がある', '障害がある'],
  });
});

test('あなた: 病気やけが、障害はありますか？: 次の質問が「業務によって病気やけがをしましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['病気がある', 'けがをしている', '障害がある'],
    },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '業務によって病気やけがをしましたか？'
  );
});

test('あなた: 病気やけが、障害はありますか？: 1つも選ばれていない場合、次の質問が「介護施設に入所していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: [],
    },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('介護施設に入所していますか？');
});

test('あなた: 病気やけが、障害はありますか？: 「障害がある」のみ選ばれている場合、次の質問が「身体障害者手帳を持っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['障害がある'],
    },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('身体障害者手帳を持っていますか？');
});

test('あなた: 病気やけが、障害はありますか？: 「病気がある」が選ばれている場合、次の質問が「業務によって病気やけがをしましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['病気がある'],
    },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '業務によって病気やけがをしましたか？'
  );
});

test('あなた: 病気やけが、障害はありますか？: 「けがをしている」が選ばれている場合、次の質問が「業務によって病気やけがをしましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['けがをしている'],
    },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '業務によって病気やけがをしましたか？'
  );
});

test('あなた: 病気やけが、障害はありますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '病気やけが、障害はありますか？');

  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['病気がある', '障害がある'],
    },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('病気やけが、障害はありますか？');
  expect(
    actor.getSnapshot().context['病気やけが、障害はありますか？']['あなた'][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: ['病気がある', '障害がある'],
  });
});

test('あなた: 業務によって病気やけがをしましたか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '業務によって病気やけがをしましたか？');

  actor.send({
    type: '業務によって病気やけがをしましたか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  expect(
    actor.getSnapshot().context['業務によって病気やけがをしましたか？'][
      'あなた'
    ][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: [],
  });
});

test('あなた: 業務によって病気やけがをしましたか？: 次の質問が「病気やけがによって連続3日以上休業していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '業務によって病気やけがをしましたか？');

  actor.send({
    type: '業務によって病気やけがをしましたか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '病気やけがによって連続3日以上休業していますか？'
  );
});

test('あなた: 業務によって病気やけがをしましたか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '業務によって病気やけがをしましたか？');

  actor.send({
    type: '業務によって病気やけがをしましたか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '業務によって病気やけがをしましたか？'
  );
  expect(
    actor.getSnapshot().context['業務によって病気やけがをしましたか？'][
      'あなた'
    ][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: [],
  });
});

test('あなた: 病気やけがによって連続3日以上休業していますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '病気やけがによって連続3日以上休業していますか？');

  actor.send({
    type: '病気やけがによって連続3日以上休業していますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  expect(
    actor.getSnapshot().context[
      '病気やけがによって連続3日以上休業していますか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: [],
  });
});

test('あなた: 病気やけがによって連続3日以上休業していますか？: 次の質問が「入院中ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '病気やけがによって連続3日以上休業していますか？');

  actor.send({
    type: '病気やけがによって連続3日以上休業していますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('入院中ですか？');
});

test('あなた: 病気やけがによって連続3日以上休業していますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '病気やけがによって連続3日以上休業していますか？');

  actor.send({
    type: '病気やけがによって連続3日以上休業していますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '病気やけがによって連続3日以上休業していますか？'
  );
  expect(
    actor.getSnapshot().context[
      '病気やけがによって連続3日以上休業していますか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: [],
  });
});

test('あなた: 入院中ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '入院中ですか？');

  actor.send({
    type: '入院中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(actor.getSnapshot().context['入院中ですか？']['あなた'][0]).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 入院中ですか？: 次の質問が「在宅療養中（結核、または治療に3か月以上かかるもの）ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '入院中ですか？');

  actor.send({
    type: '入院中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
  );
});

test('あなた: 入院中ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '入院中ですか？');

  actor.send({
    type: '入院中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('入院中ですか？');
  expect(actor.getSnapshot().context['入院中ですか？']['あなた'][0]).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 在宅療養中（結核、または治療に3か月以上かかるもの）ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(
    actor,
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
  );

  actor.send({
    type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 在宅療養中（結核、または治療に3か月以上かかるもの）ですか？: 次の質問が「感染症にかかっていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(
    actor,
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
  );

  actor.send({
    type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('感染症にかかっていますか？');
});

test('あなた: 在宅療養中（結核、または治療に3か月以上かかるもの）ですか？: 「病気がある」を選択せず「障害がある」を選択した場合次の質問が「身体障害者手帳を持っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '病気やけが、障害はありますか？');
  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['けがをしている', '障害がある'],
    },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '業務によって病気やけがをしましたか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '病気やけがによって連続3日以上休業していますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '入院中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });

  actor.send({
    type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('身体障害者手帳を持っていますか？');
});

test('あなた: 在宅療養中（結核、または治療に3か月以上かかるもの）ですか？: 「病気がある」も「障害がある」も選択しなかったた場合次の質問が「介護施設に入所していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '病気やけが、障害はありますか？');
  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['けがをしている'],
    },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '業務によって病気やけがをしましたか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '病気やけがによって連続3日以上休業していますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '入院中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });

  actor.send({
    type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('介護施設に入所していますか？');
});

test('あなた: 在宅療養中（結核、または治療に3か月以上かかるもの）ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(
    actor,
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
  );

  actor.send({
    type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
  );
  expect(
    actor.getSnapshot().context[
      '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 感染症にかかっていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '感染症にかかっていますか？');

  actor.send({
    type: '感染症にかかっていますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['感染症にかかっていますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 感染症にかかっていますか？: 次の質問が「HIVに感染していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '感染症にかかっていますか？');

  actor.send({
    type: '感染症にかかっていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('HIVに感染していますか？');
});

test('あなた: 感染症にかかっていますか？: falseの場合次の質問が「腎不全ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '感染症にかかっていますか？');

  actor.send({
    type: '感染症にかかっていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('腎不全ですか？');
});

test('あなた: 感染症にかかっていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '感染症にかかっていますか？');

  actor.send({
    type: '感染症にかかっていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('感染症にかかっていますか？');
  expect(
    actor.getSnapshot().context['感染症にかかっていますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: HIVに感染していますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, 'HIVに感染していますか？');

  actor.send({
    type: 'HIVに感染していますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['HIVに感染していますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: HIVに感染していますか？: 次の質問が「エイズを発症していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, 'HIVに感染していますか？');

  actor.send({
    type: 'HIVに感染していますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('エイズを発症していますか？');
});

test('あなた: HIVに感染していますか？: falseの場合次の質問が「C型肝炎に感染していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, 'HIVに感染していますか？');

  actor.send({
    type: 'HIVに感染していますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('C型肝炎に感染していますか？');
});

test('あなた: HIVに感染していますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, 'HIVに感染していますか？');

  actor.send({
    type: 'HIVに感染していますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('HIVに感染していますか？');
  expect(
    actor.getSnapshot().context['HIVに感染していますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: エイズを発症していますか？: 次の質問が「家族に血液製剤によってHIVに感染した方はいますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, 'エイズを発症していますか？');

  actor.send({
    type: 'エイズを発症していますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '家族に血液製剤によってHIVに感染した方はいますか？'
  );
});

test('あなた: エイズを発症していますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, 'エイズを発症していますか？');

  actor.send({
    type: 'エイズを発症していますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['エイズを発症していますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: エイズを発症していますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, 'エイズを発症していますか？');

  actor.send({
    type: 'エイズを発症していますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('エイズを発症していますか？');
  expect(
    actor.getSnapshot().context['エイズを発症していますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 家族に血液製剤によってHIVに感染した方はいますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '家族に血液製剤によってHIVに感染した方はいますか？');

  actor.send({
    type: '家族に血液製剤によってHIVに感染した方はいますか？',
    value: { type: 'Boolean', selection: false },
  });
  expect(
    actor.getSnapshot().context[
      '家族に血液製剤によってHIVに感染した方はいますか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: false,
  });
});

test('あなた: 家族に血液製剤によってHIVに感染した方はいますか？: 次の質問が「血液製剤の投与によってHIVに感染しましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '家族に血液製剤によってHIVに感染した方はいますか？');

  actor.send({
    type: '家族に血液製剤によってHIVに感染した方はいますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '血液製剤の投与によってHIVに感染しましたか？'
  );
});

test('あなた: 家族に血液製剤によってHIVに感染した方はいますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '家族に血液製剤によってHIVに感染した方はいますか？');

  actor.send({
    type: '家族に血液製剤によってHIVに感染した方はいますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '家族に血液製剤によってHIVに感染した方はいますか？'
  );
  expect(
    actor.getSnapshot().context[
      '家族に血液製剤によってHIVに感染した方はいますか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: false,
  });
});

test('あなた: 血液製剤の投与によってHIVに感染しましたか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '血液製剤の投与によってHIVに感染しましたか？');

  actor.send({
    type: '血液製剤の投与によってHIVに感染しましたか？',
    value: { type: 'Boolean', selection: false },
  });
  expect(
    actor.getSnapshot().context['血液製剤の投与によってHIVに感染しましたか？'][
      'あなた'
    ][0]
  ).toEqual({
    type: 'Boolean',
    selection: false,
  });
});

test('あなた: 血液製剤の投与によってHIVに感染しましたか？: 次の質問が「C型肝炎に感染していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '血液製剤の投与によってHIVに感染しましたか？');

  actor.send({
    type: '血液製剤の投与によってHIVに感染しましたか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('C型肝炎に感染していますか？');
});

test('あなた: 血液製剤の投与によってHIVに感染しましたか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '血液製剤の投与によってHIVに感染しましたか？');

  actor.send({
    type: '血液製剤の投与によってHIVに感染しましたか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '血液製剤の投与によってHIVに感染しましたか？'
  );
  expect(
    actor.getSnapshot().context['血液製剤の投与によってHIVに感染しましたか？'][
      'あなた'
    ][0]
  ).toEqual({
    type: 'Boolean',
    selection: false,
  });
});

test('あなた: C型肝炎に感染していますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, 'C型肝炎に感染していますか？');

  actor.send({
    type: 'C型肝炎に感染していますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['C型肝炎に感染していますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: C型肝炎に感染していますか？: 次の質問が「血液製剤の投与によってC型肝炎ウイルスに感染しましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, 'C型肝炎に感染していますか？');

  actor.send({
    type: 'C型肝炎に感染していますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'
  );
});

test('あなた: C型肝炎に感染していますか？: falseの場合次の質問が「腎不全ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, 'C型肝炎に感染していますか？');

  actor.send({
    type: 'C型肝炎に感染していますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('腎不全ですか？');
});

test('あなた: C型肝炎に感染していますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, 'C型肝炎に感染していますか？');

  actor.send({
    type: 'C型肝炎に感染していますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('C型肝炎に感染していますか？');
  expect(
    actor.getSnapshot().context['C型肝炎に感染していますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 血液製剤の投与によってC型肝炎ウイルスに感染しましたか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？');

  actor.send({
    type: '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 血液製剤の投与によってC型肝炎ウイルスに感染しましたか？: 次の質問が「肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？');

  actor.send({
    type: '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
  );
});

test('あなた: 血液製剤の投与によってC型肝炎ウイルスに感染しましたか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？');

  actor.send({
    type: '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'
  );
  expect(
    actor.getSnapshot().context[
      '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(
    actor,
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
  );

  actor.send({
    type: '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？: 次の質問が「腎不全ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(
    actor,
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
  );

  actor.send({
    type: '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('腎不全ですか？');
});

test('あなた: 肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(
    actor,
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
  );

  actor.send({
    type: '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
  );
  expect(
    actor.getSnapshot().context[
      '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 腎不全ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '腎不全ですか？');

  actor.send({
    type: '腎不全ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(actor.getSnapshot().context['腎不全ですか？']['あなた'][0]).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 腎不全ですか？: 次の質問が「慢性腎不全ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '腎不全ですか？');

  actor.send({
    type: '腎不全ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('慢性腎不全ですか？');
});

test('あなた: 腎不全ですか？: falseの場合次の質問が「先天性の血液凝固因子異常症（血友病等）ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '腎不全ですか？');

  actor.send({
    type: '腎不全ですか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '先天性の血液凝固因子異常症（血友病等）ですか？'
  );
});

test('あなた: 腎不全ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '腎不全ですか？');

  actor.send({
    type: '腎不全ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('腎不全ですか？');
  expect(actor.getSnapshot().context['腎不全ですか？']['あなた'][0]).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 慢性腎不全ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '慢性腎不全ですか？');

  actor.send({
    type: '慢性腎不全ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['慢性腎不全ですか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 慢性腎不全ですか？: 次の質問が「人工透析を行っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '慢性腎不全ですか？');

  actor.send({
    type: '慢性腎不全ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('人工透析を行っていますか？');
});

test('あなた: 慢性腎不全ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '慢性腎不全ですか？');

  actor.send({
    type: '慢性腎不全ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('慢性腎不全ですか？');
  expect(
    actor.getSnapshot().context['慢性腎不全ですか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 人工透析を行っていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '人工透析を行っていますか？');

  actor.send({
    type: '人工透析を行っていますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['人工透析を行っていますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 人工透析を行っていますか？: 次の質問が「先天性の血液凝固因子異常症（血友病等）ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '人工透析を行っていますか？');

  actor.send({
    type: '人工透析を行っていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '先天性の血液凝固因子異常症（血友病等）ですか？'
  );
});

test('あなた: 人工透析を行っていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '人工透析を行っていますか？');

  actor.send({
    type: '人工透析を行っていますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('人工透析を行っていますか？');
  expect(
    actor.getSnapshot().context['人工透析を行っていますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 先天性の血液凝固因子異常症（血友病等）ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '先天性の血液凝固因子異常症（血友病等）ですか？');

  actor.send({
    type: '先天性の血液凝固因子異常症（血友病等）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '先天性の血液凝固因子異常症（血友病等）ですか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 先天性の血液凝固因子異常症（血友病等）ですか？: 次の質問が「血液凝固因子異常症のうち、当てはまるものはどれですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '先天性の血液凝固因子異常症（血友病等）ですか？');

  actor.send({
    type: '先天性の血液凝固因子異常症（血友病等）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '血液凝固因子異常症のうち、当てはまるものはどれですか？'
  );
});

test('あなた: 先天性の血液凝固因子異常症（血友病等）ですか？: falseかつ「障害がある」を選択している場合、次の質問が「身体障害者手帳を持っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '先天性の血液凝固因子異常症（血友病等）ですか？');

  actor.send({
    type: '先天性の血液凝固因子異常症（血友病等）ですか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('身体障害者手帳を持っていますか？');
});

test('あなた: 先天性の血液凝固因子異常症（血友病等）ですか？: falseかつ「障害がある」を選択していない場合、次の質問が「介護施設に入所していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '病気やけが、障害はありますか？');
  actor.send({
    type: '病気やけが、障害はありますか？',
    value: {
      type: 'MultipleSelection',
      selection: ['病気がある'],
    },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '業務によって病気やけがをしましたか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '病気やけがによって連続3日以上休業していますか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '入院中ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '感染症にかかっていますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({
    type: '腎不全ですか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });

  actor.send({
    type: '先天性の血液凝固因子異常症（血友病等）ですか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('介護施設に入所していますか？');
});

test('あなた: 先天性の血液凝固因子異常症（血友病等）ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '先天性の血液凝固因子異常症（血友病等）ですか？');

  actor.send({
    type: '先天性の血液凝固因子異常症（血友病等）ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '先天性の血液凝固因子異常症（血友病等）ですか？'
  );
  expect(
    actor.getSnapshot().context[
      '先天性の血液凝固因子異常症（血友病等）ですか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 血液凝固因子異常症のうち、当てはまるものはどれですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '血液凝固因子異常症のうち、当てはまるものはどれですか？');

  actor.send({
    type: '血液凝固因子異常症のうち、当てはまるものはどれですか？',
    value: {
      type: 'MultipleSelection',
      selection: [
        '第VIII因子欠乏症（血友病A）',
        'Von Willebrand（フォン・ヴィルブランド）病',
      ],
    },
  });
  expect(
    actor.getSnapshot().context[
      '血液凝固因子異常症のうち、当てはまるものはどれですか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: [
      '第VIII因子欠乏症（血友病A）',
      'Von Willebrand（フォン・ヴィルブランド）病',
    ],
  });
});

test('あなた: 血液凝固因子異常症のうち、当てはまるものはどれですか？: 次の質問が「身体障害者手帳を持っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '血液凝固因子異常症のうち、当てはまるものはどれですか？');

  actor.send({
    type: '血液凝固因子異常症のうち、当てはまるものはどれですか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('身体障害者手帳を持っていますか？');
});

test('あなた: 血液凝固因子異常症のうち、当てはまるものはどれですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '血液凝固因子異常症のうち、当てはまるものはどれですか？');

  actor.send({
    type: '血液凝固因子異常症のうち、当てはまるものはどれですか？',
    value: { type: 'MultipleSelection', selection: [] },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '血液凝固因子異常症のうち、当てはまるものはどれですか？'
  );
  expect(
    actor.getSnapshot().context[
      '血液凝固因子異常症のうち、当てはまるものはどれですか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: [],
  });
});

test('あなた: 身体障害者手帳を持っていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '身体障害者手帳を持っていますか？');

  actor.send({
    type: '身体障害者手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  expect(
    actor.getSnapshot().context['身体障害者手帳を持っていますか？']['あなた'][0]
  ).toEqual({
    type: 'Selection',
    selection: '上記以外／持っていない',
  });
});

test('あなた: 身体障害者手帳を持っていますか？: 次の質問が「精神障害者保健福祉手帳を持っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '身体障害者手帳を持っていますか？');

  actor.send({
    type: '身体障害者手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '精神障害者保健福祉手帳を持っていますか？'
  );
});

test('あなた: 身体障害者手帳を持っていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '身体障害者手帳を持っていますか？');

  actor.send({
    type: '身体障害者手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('身体障害者手帳を持っていますか？');
  expect(
    actor.getSnapshot().context['身体障害者手帳を持っていますか？']['あなた'][0]
  ).toEqual({
    type: 'Selection',
    selection: '上記以外／持っていない',
  });
});

test('あなた: 精神障害者保健福祉手帳を持っていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '精神障害者保健福祉手帳を持っていますか？');

  actor.send({
    type: '精神障害者保健福祉手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  expect(
    actor.getSnapshot().context['精神障害者保健福祉手帳を持っていますか？'][
      'あなた'
    ][0]
  ).toEqual({
    type: 'Selection',
    selection: '上記以外／持っていない',
  });
});

test('あなた: 精神障害者保健福祉手帳を持っていますか？: 次の質問が「療育手帳、または愛の手帳を持っていますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '精神障害者保健福祉手帳を持っていますか？');

  actor.send({
    type: '精神障害者保健福祉手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '療育手帳、または愛の手帳を持っていますか？'
  );
});

test('あなた: 精神障害者保健福祉手帳を持っていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '精神障害者保健福祉手帳を持っていますか？');

  actor.send({
    type: '精神障害者保健福祉手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '精神障害者保健福祉手帳を持っていますか？'
  );
  expect(
    actor.getSnapshot().context['精神障害者保健福祉手帳を持っていますか？'][
      'あなた'
    ][0]
  ).toEqual({
    type: 'Selection',
    selection: '上記以外／持っていない',
  });
});

test('あなた: 療育手帳、または愛の手帳を持っていますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '療育手帳、または愛の手帳を持っていますか？');

  actor.send({
    type: '療育手帳、または愛の手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  expect(
    actor.getSnapshot().context['療育手帳、または愛の手帳を持っていますか？'][
      'あなた'
    ][0]
  ).toEqual({
    type: 'Selection',
    selection: '上記以外／持っていない',
  });
});

test('あなた: 療育手帳、または愛の手帳を持っていますか？: 次の質問が「放射線障害がありますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '療育手帳、または愛の手帳を持っていますか？');

  actor.send({
    type: '療育手帳、または愛の手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('放射線障害がありますか？');
});

test('あなた: 療育手帳、または愛の手帳を持っていますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '療育手帳、または愛の手帳を持っていますか？');

  actor.send({
    type: '療育手帳、または愛の手帳を持っていますか？',
    value: { type: 'Selection', selection: '上記以外／持っていない' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '療育手帳、または愛の手帳を持っていますか？'
  );
  expect(
    actor.getSnapshot().context['療育手帳、または愛の手帳を持っていますか？'][
      'あなた'
    ][0]
  ).toEqual({
    type: 'Selection',
    selection: '上記以外／持っていない',
  });
});

test('あなた: 放射線障害がありますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '放射線障害がありますか？');

  actor.send({
    type: '放射線障害がありますか？',
    value: { type: 'Selection', selection: '現罹患者' },
  });
  expect(
    actor.getSnapshot().context['放射線障害がありますか？']['あなた'][0]
  ).toEqual({
    type: 'Selection',
    selection: '現罹患者',
  });
});

test('あなた: 放射線障害がありますか？: 次の質問が「内部障害（内臓などのからだの内部の障害）がありますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '放射線障害がありますか？');

  actor.send({
    type: '放射線障害がありますか？',
    value: { type: 'Selection', selection: '現罹患者' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '内部障害（内臓などのからだの内部の障害）がありますか？'
  );
});

test('あなた: 放射線障害がありますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '放射線障害がありますか？');

  actor.send({
    type: '放射線障害がありますか？',
    value: { type: 'Selection', selection: '現罹患者' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('放射線障害がありますか？');
  expect(
    actor.getSnapshot().context['放射線障害がありますか？']['あなた'][0]
  ).toEqual({
    type: 'Selection',
    selection: '現罹患者',
  });
});

test('あなた: 内部障害（内臓などのからだの内部の障害）がありますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '内部障害（内臓などのからだの内部の障害）がありますか？');

  actor.send({
    type: '内部障害（内臓などのからだの内部の障害）がありますか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '内部障害（内臓などのからだの内部の障害）がありますか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 内部障害（内臓などのからだの内部の障害）がありますか？: 次の質問が「脳性まひ、または進行性筋萎縮症ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '内部障害（内臓などのからだの内部の障害）がありますか？');

  actor.send({
    type: '内部障害（内臓などのからだの内部の障害）がありますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '脳性まひ、または進行性筋萎縮症ですか？'
  );
});

test('あなた: 内部障害（内臓などのからだの内部の障害）がありますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '内部障害（内臓などのからだの内部の障害）がありますか？');

  actor.send({
    type: '内部障害（内臓などのからだの内部の障害）がありますか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '内部障害（内臓などのからだの内部の障害）がありますか？'
  );
  expect(
    actor.getSnapshot().context[
      '内部障害（内臓などのからだの内部の障害）がありますか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 脳性まひ、または進行性筋萎縮症ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '脳性まひ、または進行性筋萎縮症ですか？');

  actor.send({
    type: '脳性まひ、または進行性筋萎縮症ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['脳性まひ、または進行性筋萎縮症ですか？'][
      'あなた'
    ][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 脳性まひ、または進行性筋萎縮症ですか？: 次の質問が「介護施設に入所していますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '脳性まひ、または進行性筋萎縮症ですか？');

  actor.send({
    type: '脳性まひ、または進行性筋萎縮症ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('介護施設に入所していますか？');
});

test('あなた: 脳性まひ、または進行性筋萎縮症ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '脳性まひ、または進行性筋萎縮症ですか？');

  actor.send({
    type: '脳性まひ、または進行性筋萎縮症ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '脳性まひ、または進行性筋萎縮症ですか？'
  );
  expect(
    actor.getSnapshot().context['脳性まひ、または進行性筋萎縮症ですか？'][
      'あなた'
    ][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 介護施設に入所していますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '介護施設に入所していますか？');

  actor.send({
    type: '介護施設に入所していますか？',
    value: { type: 'Boolean', selection: false },
  });
  expect(
    actor.getSnapshot().context['介護施設に入所していますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: false,
  });
});

test('あなた: 介護施設に入所していますか？: 次の質問が「高校、大学、専門学校、職業訓練学校等の学生ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '介護施設に入所していますか？');

  actor.send({
    type: '介護施設に入所していますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe(
    '高校、大学、専門学校、職業訓練学校等の学生ですか？'
  );
});

test('あなた: 介護施設に入所していますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '介護施設に入所していますか？');

  actor.send({
    type: '介護施設に入所していますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('介護施設に入所していますか？');
  expect(
    actor.getSnapshot().context['介護施設に入所していますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: false,
  });
});

test('あなた: 高校、大学、専門学校、職業訓練学校等の学生ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '高校、大学、専門学校、職業訓練学校等の学生ですか？');

  actor.send({
    type: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context[
      '高校、大学、専門学校、職業訓練学校等の学生ですか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 高校、大学、専門学校、職業訓練学校等の学生ですか？: 次の質問が「家を借りたいですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '高校、大学、専門学校、職業訓練学校等の学生ですか？');

  actor.send({
    type: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('家を借りたいですか？');
});

test('あなた: 高校、大学、専門学校、職業訓練学校等の学生ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '高校、大学、専門学校、職業訓練学校等の学生ですか？');

  actor.send({
    type: '高校、大学、専門学校、職業訓練学校等の学生ですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe(
    '高校、大学、専門学校、職業訓練学校等の学生ですか？'
  );
  expect(
    actor.getSnapshot().context[
      '高校、大学、専門学校、職業訓練学校等の学生ですか？'
    ]['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 家を借りたいですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '家を借りたいですか？');

  actor.send({
    type: '家を借りたいですか？',
    value: { type: 'Boolean', selection: true },
  });
  expect(
    actor.getSnapshot().context['家を借りたいですか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 家を借りたいですか？: 次の質問が「妊娠中、または産後6ヵ月以内ですか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '家を借りたいですか？');

  actor.send({
    type: '家を借りたいですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('妊娠中、または産後6ヵ月以内ですか？');
});

test('あなた: 家を借りたいですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '家を借りたいですか？');

  actor.send({
    type: '家を借りたいですか？',
    value: { type: 'Boolean', selection: true },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('家を借りたいですか？');
  expect(
    actor.getSnapshot().context['家を借りたいですか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: true,
  });
});

test('あなた: 妊娠中、または産後6ヵ月以内ですか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '妊娠中、または産後6ヵ月以内ですか？');

  actor.send({
    type: '妊娠中、または産後6ヵ月以内ですか？',
    value: { type: 'Selection', selection: '妊娠6ヵ月未満' },
  });
  expect(
    actor.getSnapshot().context['妊娠中、または産後6ヵ月以内ですか？'][
      'あなた'
    ][0]
  ).toEqual({
    type: 'Selection',
    selection: '妊娠6ヵ月未満',
  });
});

test('あなた: 妊娠中、または産後6ヵ月以内ですか？: 次の質問が「困りごとはありますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '妊娠中、または産後6ヵ月以内ですか？');

  actor.send({
    type: '妊娠中、または産後6ヵ月以内ですか？',
    value: { type: 'Selection', selection: '妊娠6ヵ月未満' },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('困りごとはありますか？');
});

test('あなた: 妊娠中、または産後6ヵ月以内ですか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '妊娠中、または産後6ヵ月以内ですか？');

  actor.send({
    type: '妊娠中、または産後6ヵ月以内ですか？',
    value: { type: 'Selection', selection: '妊娠6ヵ月未満' },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('妊娠中、または産後6ヵ月以内ですか？');
  expect(
    actor.getSnapshot().context['妊娠中、または産後6ヵ月以内ですか？'][
      'あなた'
    ][0]
  ).toEqual({
    type: 'Selection',
    selection: '妊娠6ヵ月未満',
  });
});

test('あなた: 困りごとはありますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '困りごとはありますか？');

  actor.send({
    type: '困りごとはありますか？',
    value: { type: 'MultipleSelection', selection: ['仕事について'] },
  });
  expect(
    actor.getSnapshot().context['困りごとはありますか？']['あなた'][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: ['仕事について'],
  });
});

test('あなた: 困りごとはありますか？: 次の質問が「配偶者はいますか？」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '困りごとはありますか？');

  actor.send({
    type: '困りごとはありますか？',
    value: { type: 'MultipleSelection', selection: ['仕事について'] },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('配偶者はいますか？');
});

test('あなた: 困りごとはありますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '困りごとはありますか？');

  actor.send({
    type: '困りごとはありますか？',
    value: { type: 'MultipleSelection', selection: ['仕事について'] },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('困りごとはありますか？');
  expect(
    actor.getSnapshot().context['困りごとはありますか？']['あなた'][0]
  ).toEqual({
    type: 'MultipleSelection',
    selection: ['仕事について'],
  });
});

test('あなた: 配偶者はいますか？: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '配偶者はいますか？');

  actor.send({
    type: '配偶者はいますか？',
    value: { type: 'Boolean', selection: false },
  });
  expect(
    actor.getSnapshot().context['配偶者はいますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: false,
  });
});

test('あなた: 配偶者はいますか？: 次の質問が「子どもの人数」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '配偶者はいますか？');

  actor.send({
    type: '配偶者はいますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('子どもの人数');
});

// TODO: trueの場合、配偶者の質問へ遷移

test('あなた: 配偶者はいますか？: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '配偶者はいますか？');

  actor.send({
    type: '配偶者はいますか？',
    value: { type: 'Boolean', selection: false },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('配偶者はいますか？');
  expect(
    actor.getSnapshot().context['配偶者はいますか？']['あなた'][0]
  ).toEqual({
    type: 'Boolean',
    selection: false,
  });
});

test('あなた: 子どもの人数: 値が設定されている', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '子どもの人数');

  actor.send({
    type: '子どもの人数',
    value: { type: 'PersonNum', selection: 0 },
  });
  expect(actor.getSnapshot().context['子どもの人数']['あなた'][0]).toEqual({
    type: 'PersonNum',
    selection: 0,
  });
});

test('あなた: 子どもの人数: 次の質問が「親の人数」', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '子どもの人数');

  actor.send({
    type: '子どもの人数',
    value: { type: 'PersonNum', selection: 0 },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('親の人数');
});

// TODO: 子どもがいる場合、子どもの質問へ遷移

test('あなた: 子どもの人数: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '子どもの人数');

  actor.send({
    type: '子どもの人数',
    value: { type: 'PersonNum', selection: 0 },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('子どもの人数');
  expect(actor.getSnapshot().context['子どもの人数']['あなた'][0]).toEqual({
    type: 'PersonNum',
    selection: 0,
  });
});

test('あなた: 親の人数: この質問で終了', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '親の人数');

  actor.send({
    type: '親の人数',
    value: { type: 'PersonNum', selection: 0 },
  });
  actor.send({ type: 'next' });
  expect(actor.getSnapshot().value).toBe('result');
});

// TODO: 親がいる場合、親の質問へ遷移

test('あなた: 親の人数: next->backで元の質問に戻る', () => {
  const actor = createActor(questionStateMachine);
  actor.start();
  skipUntil(actor, '親の人数');

  actor.send({
    type: '親の人数',
    value: { type: 'PersonNum', selection: 0 },
  });
  actor.send({ type: 'next' });
  actor.send({ type: 'back' });
  expect(actor.getSnapshot().value).toBe('親の人数');
  expect(actor.getSnapshot().context['親の人数']['あなた'][0]).toEqual({
    type: 'PersonNum',
    selection: 0,
  });
});

// TODO: 本実装時にすべての状態遷移とassignをテスト
