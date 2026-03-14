import { expect, test } from 'vitest';
import { QuestionStateContext } from './questionState';
import { toOpenFiscaHousehold } from './convert';

const boolField = () => ({
  あなた: [{ type: 'Boolean' as const, selection: undefined }],
  配偶者: [] as never[],
  子ども: [] as never[],
  親: [] as never[],
});

const multiSelField = () => ({
  あなた: [{ type: 'MultipleSelection' as const, selection: [] as never[] }],
  配偶者: [] as never[],
  子ども: [] as never[],
  親: [] as never[],
});

const defaultContext = (): QuestionStateContext => {
  return {
    寝泊まりしている地域: {
      あなた: [{ type: 'Address', prefecure: '', municipality: '' }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    年齢: {
      あなた: [{ type: 'Age', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    年収: {
      あなた: [{ type: 'AmountOfMoney', selection: undefined, unit: '万円' }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    預貯金: {
      あなた: [{ type: 'AmountOfMoney', selection: undefined, unit: '万円' }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '現在仕事をしていますか？': boolField(),
    仕事: {
      あなた: [{ type: 'Selection', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '6か月以内に新しい仕事を始めましたか？': boolField(),
    '休職中ですか？': boolField(),
    '休職中に給与の支払いがない状態ですか？': boolField(),
    '病気やけが、障害はありますか？': multiSelField(),
    '業務によって病気やけがをしましたか？': multiSelField(),
    '病気やけがによって連続3日以上休業していますか？': multiSelField(),
    '入院中ですか？': boolField(),
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？': boolField(),
    '感染症にかかっていますか？': boolField(),
    'HIVに感染していますか？': boolField(),
    'エイズを発症していますか？': boolField(),
    '家族に血液製剤によってHIVに感染した方はいますか？': boolField(),
    '血液製剤の投与によってHIVに感染しましたか？': boolField(),
    'C型肝炎に感染していますか？': boolField(),
    '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？': boolField(),
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？':
      boolField(),
    '腎不全ですか？': boolField(),
    '慢性腎不全ですか？': boolField(),
    '人工透析を行っていますか？': boolField(),
    '先天性の血液凝固因子異常症（血友病等）ですか？': boolField(),
    '血液凝固因子異常症のうち、当てはまるものはどれですか？': multiSelField(),
    '身体障害者手帳を持っていますか？': {
      あなた: [{ type: 'Selection', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '精神障害者保健福祉手帳を持っていますか？': {
      あなた: [{ type: 'Selection', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '療育手帳、または愛の手帳を持っていますか？': {
      あなた: [{ type: 'Selection', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '放射線障害がありますか？': {
      あなた: [{ type: 'Selection', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '内部障害（内臓などのからだの内部の障害）がありますか？': boolField(),
    '脳性まひ、または進行性筋萎縮症ですか？': boolField(),
    '介護施設に入所していますか？': boolField(),
    '高校、大学、専門学校、職業訓練学校等の学生ですか？': boolField(),
    '家を借りたいですか？': boolField(),
    '妊娠中、または産後6ヵ月以内ですか？': {
      あなた: [{ type: 'Selection', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '困りごとはありますか？': multiSelField(),
    '配偶者はいますか？': boolField(),
    子どもの人数: {
      あなた: [{ type: 'PersonNum', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    親の人数: {
      あなた: [{ type: 'PersonNum', selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    currentMember: { relationship: 'あなた', index: 0 },
    histories: [],
  };
};

const currentDate = '2026-01-01'; // ダミー値

// contextに対応するopenFiscaHouseholdの形式チェック
// 「かんたん見積もり」等、当該質問が未回答のまま見積もり結果に遷移する場合に対応するプロパティが未設定であることも検証

test('居住値が設定されている', () => {
  const context = defaultContext();
  context['寝泊まりしている地域'].あなた[0].prefecure = '東京都';
  context['寝泊まりしている地域'].あなた[0].municipality = '渋谷区';

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯一覧.世帯1.居住都道府県[currentDate]).toEqual('東京都');
  expect(actual.世帯一覧.世帯1.居住市区町村[currentDate]).toEqual('渋谷区');
});

test('居住値が東京都の場合、東京独自の支援制度が設定されている', () => {
  const context = defaultContext();
  context['寝泊まりしている地域'].あなた[0].prefecure = '東京都';
  context['寝泊まりしている地域'].あなた[0].municipality = '渋谷区';

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
  context['寝泊まりしている地域'].あなた[0].prefecure = '神奈川県';
  context['寝泊まりしている地域'].あなた[0].municipality = '横浜市';

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯一覧.世帯1).not.toHaveProperty('児童育成手当');
  expect(actual.世帯一覧.世帯1).not.toHaveProperty('障害児童育成手当');
  expect(actual.世帯一覧.世帯1).not.toHaveProperty('重度心身障害者手当_最小');
  expect(actual.世帯一覧.世帯1).not.toHaveProperty('重度心身障害者手当_最大');
  expect(actual.世帯一覧.世帯1).not.toHaveProperty('受験生チャレンジ支援貸付');
});

test('年齢が設定されている', () => {
  const context = defaultContext();
  context['年齢'].あなた[0].selection = 20;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた.誕生年月日.ETERNITY).toEqual('2006-01-01');
});

test('年齢はcurrentDateに関わらず誕生年1月1日生まれに換算される', () => {
  const context = defaultContext();
  context['年齢'].あなた[0].selection = 20;

  const actual = toOpenFiscaHousehold({ context, currentDate: '2026-04-01' });

  expect(actual.世帯員.あなた.誕生年月日.ETERNITY).toEqual('2006-01-01');
});

test('年齢未回答の場合設定されていない', () => {
  const context = defaultContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた).not.toHaveProperty('誕生年月日');
});

test('年収が設定されている', () => {
  const context = defaultContext();
  context['年収'].あなた[0].selection = 300;
  context['年収'].あなた[0].unit = '万円';

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた.収入[currentDate]).toEqual(3000000);
});

test('年収未回答の場合設定されていない', () => {
  const context = defaultContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた).not.toHaveProperty('収入');
});

test('預貯金が設定されている', () => {
  const context = defaultContext();
  context['預貯金'].あなた[0].selection = 300;
  context['預貯金'].あなた[0].unit = '万円';

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた.預貯金[currentDate]).toEqual(3000000);
});

test('預貯金未回答の場合設定されていない', () => {
  const context = defaultContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた).not.toHaveProperty('預貯金');
});

test('仕事の種類が設定されている', () => {
  const context = defaultContext();
  context['仕事'].あなた[0].selection = '会社員';

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた.就労形態[currentDate]).toEqual('会社員');
});

test('仕事の種類未回答の場合設定されていない', () => {
  const context = defaultContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた).not.toHaveProperty('就労形態');
});

test('6か月以内に新しい仕事を始めたかどうかが設定されている', () => {
  const context = defaultContext();
  context['6か月以内に新しい仕事を始めましたか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた.六か月以内に新規就労[currentDate]).toEqual(true);
});

test('6か月以内に新しい仕事を始めたかどうか未回答の場合設定されていない', () => {
  const context = defaultContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた).not.toHaveProperty('六か月以内に新規就労');
});

test('6か月以内に新しい仕事を始めたかどうかが設定されている', () => {
  const context = defaultContext();
  context['休職中に給与の支払いがない状態ですか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた.休業中に給与の支払いがない[currentDate]).toEqual(
    true
  );
});

test('休職中に給与の支払いがない状態かどうか未回答の場合設定されていない', () => {
  const context = defaultContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた).not.toHaveProperty('休業中に給与の支払いがない');
});

test('業務によって病気になったかどうかが設定されている', () => {
  const context = defaultContext();
  context['業務によって病気やけがをしましたか？'].あなた[0].selection = [
    '業務によって病気になった',
  ];

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた.業務によって病気になった[currentDate]).toEqual(
    true
  );
  // 別のvariableには影響しない
  expect(actual.世帯員.あなた.業務によってけがをした[currentDate]).toEqual(
    false
  );
});

test('業務によってけがをしたかどうかが設定されている', () => {
  const context = defaultContext();
  context['業務によって病気やけがをしましたか？'].あなた[0].selection = [
    '業務によってけがをした',
  ];

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた.業務によってけがをした[currentDate]).toEqual(
    true
  );
  // 別のvariableには影響しない
  expect(actual.世帯員.あなた.業務によって病気になった[currentDate]).toEqual(
    false
  );
});

test('病気によって連続三日以上休業しているかどうかが設定されている', () => {
  const context = defaultContext();
  context[
    '病気やけがによって連続3日以上休業していますか？'
  ].あなた[0].selection = ['病気によって連続三日以上休業している'];

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.あなた.病気によって連続三日以上休業している[currentDate]
  ).toEqual(true);
  // 別のvariableには影響しない
  expect(
    actual.世帯員.あなた.けがによって連続三日以上休業している[currentDate]
  ).toEqual(false);
});

test('けがによって連続三日以上休業しているかどうかが設定されている', () => {
  const context = defaultContext();
  context[
    '病気やけがによって連続3日以上休業していますか？'
  ].あなた[0].selection = ['けがによって連続三日以上休業している'];

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.あなた.けがによって連続三日以上休業している[currentDate]
  ).toEqual(true);
  // 別のvariableには影響しない
  expect(
    actual.世帯員.あなた.病気によって連続三日以上休業している[currentDate]
  ).toEqual(false);
});

test('入院中かどうかが設定されている', () => {
  const context = defaultContext();
  context['入院中ですか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた.入院中[currentDate]).toEqual(true);
});

test('入院中かどうか未回答の場合設定されていない', () => {
  const context = defaultContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた).not.toHaveProperty('入院中');
});

test('在宅療養中かどうかが設定されている', () => {
  const context = defaultContext();
  context[
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
  ].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた.在宅療養中[currentDate]).toEqual(true);
});

test('在宅療養中かどうか未回答の場合設定されていない', () => {
  const context = defaultContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた).not.toHaveProperty('在宅療養中');
});

test('HIV感染者であるかどうかが設定されている', () => {
  const context = defaultContext();
  context['HIVに感染していますか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた.HIV感染者である[currentDate]).toEqual(true);
});

test('エイズを発症しているかどうかが設定されている', () => {
  const context = defaultContext();
  context['エイズを発症していますか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた.エイズを発症している[currentDate]).toEqual(true);
});

test('エイズを発症しているかどうか未回答の場合設定されていない', () => {
  const context = defaultContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた).not.toHaveProperty('エイズを発症している');
});

test('家族に血液製剤によるHIV感染者がいるかどうかが設定されている', () => {
  const context = defaultContext();
  context[
    '家族に血液製剤によってHIVに感染した方はいますか？'
  ].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.あなた.家族に血液製剤によるHIV感染者がいる[currentDate]
  ).toEqual(true);
});

test('家族に血液製剤によるHIV感染者がいるかどうか未回答の場合設定されていない', () => {
  const context = defaultContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた).not.toHaveProperty(
    '家族に血液製剤によるHIV感染者がいる'
  );
});

test('血液製剤の投与によってHIVに感染したかどうかが設定されている', () => {
  const context = defaultContext();
  context['血液製剤の投与によってHIVに感染しましたか？'].あなた[0].selection =
    true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.あなた.血液製剤の投与によってHIVに感染した[currentDate]
  ).toEqual(true);
});

test('血液製剤の投与によってHIVに感染したかどうか未回答の場合設定されていない', () => {
  const context = defaultContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた).not.toHaveProperty(
    '血液製剤の投与によってHIVに感染した'
  );
});

test('血液製剤の投与によってC型肝炎ウイルスに感染したかどうかが設定されている', () => {
  const context = defaultContext();
  context[
    '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'
  ].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.あなた.血液製剤の投与によってC型肝炎ウイルスに感染した[
      currentDate
    ]
  ).toEqual(true);
});

test('血液製剤の投与によってC型肝炎ウイルスに感染したかどうか未回答の場合設定されていない', () => {
  const context = defaultContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた).not.toHaveProperty(
    '血液製剤の投与によってC型肝炎ウイルスに感染した'
  );
});

test('肝硬変や肝がんに罹患しているまたは肝移植をおこなったかどうかが設定されている', () => {
  const context = defaultContext();
  context[
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
  ].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.あなた.肝硬変や肝がんに罹患しているまたは肝移植をおこなった[
      currentDate
    ]
  ).toEqual(true);
});

test('肝硬変や肝がんに罹患しているまたは肝移植をおこなったかどうか未回答の場合設定されていない', () => {
  const context = defaultContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた).not.toHaveProperty(
    '肝硬変や肝がんに罹患しているまたは肝移植をおこなった'
  );
});

test('慢性腎不全かどうかが設定されている', () => {
  const context = defaultContext();
  context['慢性腎不全ですか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた.慢性腎不全である[currentDate]).toEqual(true);
});

test('慢性腎不全かどうか未回答の場合設定されていない', () => {
  const context = defaultContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた).not.toHaveProperty('慢性腎不全である');
});

test('人工透析を行っているかどうかが設定されている', () => {
  const context = defaultContext();
  context['人工透析を行っていますか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた.人工透析を行っている[currentDate]).toEqual(true);
});

test('人工透析を行っているかどうか未回答の場合設定されていない', () => {
  const context = defaultContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた).not.toHaveProperty('人工透析を行っている');
});

test('第I因子欠乏症かどうかが設定されている', () => {
  const context = defaultContext();
  context[
    '血液凝固因子異常症のうち、当てはまるものはどれですか？'
  ].あなた[0].selection = ['第I因子（フィブリノゲン）欠乏症'];

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.あなた.血液凝固因子異常症_第I因子欠乏症[currentDate]
  ).toEqual(true);
  // 他の因子欠乏症は選択されない
  expect(
    actual.世帯員.あなた.血液凝固因子異常症_フォンヴィルブランド病[currentDate]
  ).toEqual(false);
});

test('第II因子欠乏症かどうかが設定されている', () => {
  const context = defaultContext();
  context[
    '血液凝固因子異常症のうち、当てはまるものはどれですか？'
  ].あなた[0].selection = ['第II因子（プロトロンビン）欠乏症'];

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.あなた.血液凝固因子異常症_第II因子欠乏症[currentDate]
  ).toEqual(true);
  // 他の因子欠乏症は選択されない
  expect(
    actual.世帯員.あなた.血液凝固因子異常症_第I因子欠乏症[currentDate]
  ).toEqual(false);
});

test('第V因子欠乏症かどうかが設定されている', () => {
  const context = defaultContext();
  context[
    '血液凝固因子異常症のうち、当てはまるものはどれですか？'
  ].あなた[0].selection = ['第V因子（不安定因子）欠乏症'];

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.あなた.血液凝固因子異常症_第V因子欠乏症[currentDate]
  ).toEqual(true);
  // 他の因子欠乏症は選択されない
  expect(
    actual.世帯員.あなた.血液凝固因子異常症_第I因子欠乏症[currentDate]
  ).toEqual(false);
});

test('第VII因子欠乏症かどうかが設定されている', () => {
  const context = defaultContext();
  context[
    '血液凝固因子異常症のうち、当てはまるものはどれですか？'
  ].あなた[0].selection = ['第VII因子（安定因子）欠乏症'];

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.あなた.血液凝固因子異常症_第VII因子欠乏症[currentDate]
  ).toEqual(true);
  // 他の因子欠乏症は選択されない
  expect(
    actual.世帯員.あなた.血液凝固因子異常症_第I因子欠乏症[currentDate]
  ).toEqual(false);
});

test('第VIII因子欠乏症（血友病A）かどうかが設定されている', () => {
  const context = defaultContext();
  context[
    '血液凝固因子異常症のうち、当てはまるものはどれですか？'
  ].あなた[0].selection = ['第VIII因子欠乏症（血友病A）'];

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.あなた.血液凝固因子異常症_第VIII因子欠乏症[currentDate]
  ).toEqual(true);
  // 他の因子欠乏症は選択されない
  expect(
    actual.世帯員.あなた.血液凝固因子異常症_第I因子欠乏症[currentDate]
  ).toEqual(false);
});

test('第IX因子欠乏症（血友病B）かどうかが設定されている', () => {
  const context = defaultContext();
  context[
    '血液凝固因子異常症のうち、当てはまるものはどれですか？'
  ].あなた[0].selection = ['第IX因子欠乏症（血友病B）'];

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.あなた.血液凝固因子異常症_第IX因子欠乏症[currentDate]
  ).toEqual(true);
  // 他の因子欠乏症は選択されない
  expect(
    actual.世帯員.あなた.血液凝固因子異常症_第I因子欠乏症[currentDate]
  ).toEqual(false);
});

test('第X因子欠乏症かどうかが設定されている', () => {
  const context = defaultContext();
  context[
    '血液凝固因子異常症のうち、当てはまるものはどれですか？'
  ].あなた[0].selection = ['第X因子（スチュアートプラウア）欠乏症'];

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.あなた.血液凝固因子異常症_第X因子欠乏症[currentDate]
  ).toEqual(true);
  // 他の因子欠乏症は選択されない
  expect(
    actual.世帯員.あなた.血液凝固因子異常症_第I因子欠乏症[currentDate]
  ).toEqual(false);
});

test('第XI因子欠乏症かどうかが設定されている', () => {
  const context = defaultContext();
  context[
    '血液凝固因子異常症のうち、当てはまるものはどれですか？'
  ].あなた[0].selection = ['第XI因子（PTA）欠乏症'];

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.あなた.血液凝固因子異常症_第XI因子欠乏症[currentDate]
  ).toEqual(true);
  // 他の因子欠乏症は選択されない
  expect(
    actual.世帯員.あなた.血液凝固因子異常症_第I因子欠乏症[currentDate]
  ).toEqual(false);
});

test('第XII因子欠乏症かどうかが設定されている', () => {
  const context = defaultContext();
  context[
    '血液凝固因子異常症のうち、当てはまるものはどれですか？'
  ].あなた[0].selection = ['第XII因子（ヘイグマン因子）欠乏症'];

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.あなた.血液凝固因子異常症_第XII因子欠乏症[currentDate]
  ).toEqual(true);
  // 他の因子欠乏症は選択されない
  expect(
    actual.世帯員.あなた.血液凝固因子異常症_第I因子欠乏症[currentDate]
  ).toEqual(false);
});

test('第XIII因子欠乏症かどうかが設定されている', () => {
  const context = defaultContext();
  context[
    '血液凝固因子異常症のうち、当てはまるものはどれですか？'
  ].あなた[0].selection = ['第XIII因子（フィブリン安定化因子）欠乏症'];

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.あなた.血液凝固因子異常症_第XIII因子欠乏症[currentDate]
  ).toEqual(true);
  // 他の因子欠乏症は選択されない
  expect(
    actual.世帯員.あなた.血液凝固因子異常症_第I因子欠乏症[currentDate]
  ).toEqual(false);
});

test('フォン・ヴィルブランド病かどうかが設定されている', () => {
  const context = defaultContext();
  context[
    '血液凝固因子異常症のうち、当てはまるものはどれですか？'
  ].あなた[0].selection = ['Von Willebrand（フォン・ヴィルブランド）病'];

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.あなた.血液凝固因子異常症_フォンヴィルブランド病[currentDate]
  ).toEqual(true);
  // 他の因子欠乏症は選択されない
  expect(
    actual.世帯員.あなた.血液凝固因子異常症_第I因子欠乏症[currentDate]
  ).toEqual(false);
});

test('血液凝固因子異常症がわからない・その他かどうかが設定されている', () => {
  const context = defaultContext();
  context[
    '血液凝固因子異常症のうち、当てはまるものはどれですか？'
  ].あなた[0].selection = ['わからない・その他'];

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた.血液凝固因子異常症_その他[currentDate]).toEqual(
    true
  );
  // 他の因子欠乏症は選択されない
  expect(
    actual.世帯員.あなた.血液凝固因子異常症_第I因子欠乏症[currentDate]
  ).toEqual(false);
});

test('身体障害者手帳が設定されている', () => {
  const context = defaultContext();
  context['身体障害者手帳を持っていますか？'].あなた[0].selection = '1級';

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた.身体障害者手帳等級[currentDate]).toEqual('一級');
});

test('身体障害者手帳未回答の場合設定されていない', () => {
  const context = defaultContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた).not.toHaveProperty('身体障害者手帳等級');
});

test('精神障害者保健福祉手帳が設定されている', () => {
  const context = defaultContext();
  context['精神障害者保健福祉手帳を持っていますか？'].あなた[0].selection =
    '1級';

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた.精神障害者保健福祉手帳等級[currentDate]).toEqual(
    '一級'
  );
});

test('精神障害者保健福祉手帳未回答の場合設定されていない', () => {
  const context = defaultContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた).not.toHaveProperty('精神障害者保健福祉手帳等級');
});

test('療育手帳が設定されている', () => {
  const context = defaultContext();
  context['療育手帳、または愛の手帳を持っていますか？'].あなた[0].selection =
    '療育手帳 A';

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた.療育手帳等級[currentDate]).toEqual('A');
  // 持っていない方は設定されない
  expect(actual.世帯員.あなた).not.toHaveProperty('愛の手帳等級');
});

test('愛の手帳が設定されている', () => {
  const context = defaultContext();
  context['療育手帳、または愛の手帳を持っていますか？'].あなた[0].selection =
    '愛の手帳 1度';

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた.愛の手帳等級[currentDate]).toEqual('一度');
  // 持っていない方は設定されない
  expect(actual.世帯員.あなた).not.toHaveProperty('療育手帳等級');
});

test('療育手帳、または愛の手帳未回答の場合設定されていない', () => {
  const context = defaultContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた).not.toHaveProperty('療育手帳等級');
  expect(actual.世帯員.あなた).not.toHaveProperty('愛の手帳等級');
});

test('放射線障害があるかどうかが設定されている', () => {
  const context = defaultContext();
  context['放射線障害がありますか？'].あなた[0].selection = '現罹患者';

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた.放射線障害[currentDate]).toEqual('現罹患者');
});

test('放射線障害があるかどうかが設定されている（ない場合）', () => {
  const context = defaultContext();
  context['放射線障害がありますか？'].あなた[0].selection = 'いいえ';

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた.放射線障害[currentDate]).toEqual('無');
});

test('放射線障害未回答の場合設定されていない', () => {
  const context = defaultContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた).not.toHaveProperty('放射線障害');
});

test('内部障害があるかどうかが設定されている', () => {
  const context = defaultContext();
  context[
    '内部障害（内臓などのからだの内部の障害）がありますか？'
  ].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた.内部障害[currentDate]).toEqual('有');
});

test('内部障害があるかどうかが設定されている（ない場合）', () => {
  const context = defaultContext();
  context[
    '内部障害（内臓などのからだの内部の障害）がありますか？'
  ].あなた[0].selection = false;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた.内部障害[currentDate]).toEqual('無');
});

test('内部障害未回答の場合設定されていない', () => {
  const context = defaultContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた).not.toHaveProperty('内部障害');
});

test('脳性まひ、または進行性筋萎縮症かどうかが設定されている', () => {
  const context = defaultContext();
  context['脳性まひ、または進行性筋萎縮症ですか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた.脳性まひ_進行性筋萎縮症[currentDate]).toEqual(
    '有'
  );
});

test('脳性まひ、または進行性筋萎縮症かどうかが設定されている（ない場合）', () => {
  const context = defaultContext();
  context['脳性まひ、または進行性筋萎縮症ですか？'].あなた[0].selection = false;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた.脳性まひ_進行性筋萎縮症[currentDate]).toEqual(
    '無'
  );
});

test('脳性まひ、または進行性筋萎縮症未回答の場合設定されていない', () => {
  const context = defaultContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた).not.toHaveProperty('脳性まひ_進行性筋萎縮症');
});

test('介護施設入所中かどうかが設定されている', () => {
  const context = defaultContext();
  context['介護施設に入所していますか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた.介護施設入所中[currentDate]).toEqual(true);
});

test('介護施設入所中かどうか未回答の場合設定されていない', () => {
  const context = defaultContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた).not.toHaveProperty('介護施設入所中');
});

test('学生かどうかが設定されている', () => {
  const context = defaultContext();
  context[
    '高校、大学、専門学校、職業訓練学校等の学生ですか？'
  ].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた.学生[currentDate]).toEqual(true);
});

test('学生かどうか未回答の場合設定されていない', () => {
  const context = defaultContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた).not.toHaveProperty('学生');
});

test('家を借りたいかどうかが設定されている', () => {
  const context = defaultContext();
  context['家を借りたいですか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯一覧.世帯1).toHaveProperty('住宅入居費');
  expect(actual.世帯一覧.世帯1.住宅入居費?.[currentDate]).toEqual(true);
});

test('家を借りたいかどうか未回答の場合設定されていない', () => {
  const context = defaultContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯一覧.世帯1).not.toHaveProperty('住宅入居費');
});

test('妊娠中、または産後6ヵ月以内かどうかが設定されている', () => {
  const context = defaultContext();
  context['妊娠中、または産後6ヵ月以内ですか？'].あなた[0].selection =
    '妊娠6ヵ月未満';

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた.妊産婦[currentDate]).toEqual('妊娠6ヵ月未満');
});

test('妊娠中、または産後6ヵ月以内かどうかが設定されている（「いいえ」の場合）', () => {
  const context = defaultContext();
  context['妊娠中、または産後6ヵ月以内ですか？'].あなた[0].selection = 'いいえ';

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた.妊産婦[currentDate]).toEqual('無');
});

test('妊娠中、または産後6ヵ月以内かどうか未回答の場合設定されていない', () => {
  const context = defaultContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた).not.toHaveProperty('妊産婦');
});
