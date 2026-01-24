import { expect, test } from 'vitest';
import { QuestionStateContext } from './questionState';
import { toOpenFiscaHousehold } from './convert';

const defaultContext = (): QuestionStateContext => {
  return {
    住んでいる場所: {
      あなた: [
        {
          type: 'Address',
          prefecure: '',
          municipality: '',
        },
      ],
      配偶者: [],
      子ども: [],
      親: [],
    },
    仕事: {
      あなた: [
        {
          type: 'Selection',
          selection: undefined,
        },
      ],
      配偶者: [],
      子ども: [],
      親: [],
    },
    家を借りたい: {
      あなた: [
        {
          type: 'Boolean',
          selection: undefined,
        },
      ],
      配偶者: [],
      子ども: [],
      親: [],
    },
    currentMember: { relationship: 'あなた', index: 0 }, // 変換に不要なのでダミー値
    histories: [], // 変換に不要なのでダミー値
  };
};

const currentDate = '2026-01-01'; // ダミー値

// contextに対応するopenFiscaHouseholdの形式チェック
// 「かんたん見積もり」等、当該質問が未回答のまま見積もり結果に遷移する場合に対応するプロパティが未設定であることも検証

test('居住値が設定されている', () => {
  const context = defaultContext();
  context.住んでいる場所.あなた[0].prefecure = '東京都';
  context.住んでいる場所.あなた[0].municipality = '渋谷区';

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯一覧.世帯1.居住都道府県[currentDate]).toEqual('東京都');
  expect(actual.世帯一覧.世帯1.居住市区町村[currentDate]).toEqual('渋谷区');
});

test('居住値が東京都の場合、東京独自の支援制度が設定されている', () => {
  const context = defaultContext();
  context.住んでいる場所.あなた[0].prefecure = '東京都';
  context.住んでいる場所.あなた[0].municipality = '渋谷区';

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯一覧.世帯1).toHaveProperty('児童育成手当');
  expect(actual.世帯一覧.世帯1).toHaveProperty('障害児童育成手当');
  expect(actual.世帯一覧.世帯1).toHaveProperty('重度心身障害者手当_最小');
  expect(actual.世帯一覧.世帯1).toHaveProperty('重度心身障害者手当_最大');
  expect(actual.世帯一覧.世帯1).toHaveProperty('受験生チャレンジ支援貸付');
});

// TODO: 東京都以外の類似の制度にも対応した場合テストケースを更新
// （現状は東京都以外の制度には対応していない）
test('居住値が東京都でない場合、東京独自の支援制度は設定されない', () => {
  const context = defaultContext();
  context.住んでいる場所.あなた[0].prefecure = '神奈川県';
  context.住んでいる場所.あなた[0].municipality = '横浜市';

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯一覧.世帯1).not.toHaveProperty('児童育成手当');
  expect(actual.世帯一覧.世帯1).not.toHaveProperty('障害児童育成手当');
  expect(actual.世帯一覧.世帯1).not.toHaveProperty('重度心身障害者手当_最小');
  expect(actual.世帯一覧.世帯1).not.toHaveProperty('重度心身障害者手当_最大');
  expect(actual.世帯一覧.世帯1).not.toHaveProperty('受験生チャレンジ支援貸付');
});

test('家を借りたいかどうかが設定されている', () => {
  const context = defaultContext();
  context.家を借りたい.あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯一覧.世帯1).toHaveProperty('住宅入居費');
  expect(actual.世帯一覧.世帯1.住宅入居費?.[currentDate]).toEqual(true);
});

test('家を借りたいかどうか未回答の場合設定されていない', () => {
  const context = defaultContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯一覧.世帯1).not.toHaveProperty('住宅入居費');
});
