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
    見積もりモード: {
      あなた: [
        { type: 'Selection' as const, selection: 'くわしく見積もり' as const },
      ],
      配偶者: [],
      子ども: [],
      親: [],
    },
    // 能登半島地震被災者支援制度見積もり用
    '住宅が被害を受けていますか？': boolField(),
    '住宅被害の状況（当てはまるもののうち最も上のものを選んでください）': {
      あなた: [{ type: 'Selection' as const, selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    住宅再建方法: {
      あなた: [{ type: 'Selection' as const, selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '家財の３分の１以上の損害が発生しましたか？': boolField(),
    '災害により負傷し、1ヶ月以上療養を続けていますか？': boolField(),
    '災害によって、精神または身体に重い障害がありますか？': boolField(),
    '家族に災害で亡くなった方はいますか？': {
      あなた: [{ type: 'PersonNum' as const, selection: undefined }],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '災害で生計維持者が亡くなりましたか？': boolField(),
    '以下のいずれかに当てはまりますか？': {
      あなた: [],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '高校に通っていますか？': {
      あなた: [],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '通っている高校の種類を選んでください（1）': {
      あなた: [],
      配偶者: [],
      子ども: [],
      親: [],
    },
    '通っている高校の種類を選んでください（2）': {
      あなた: [],
      配偶者: [],
      子ども: [],
      親: [],
    },
    被災前の年収: {
      あなた: [{ type: 'AmountOfMoney', selection: undefined, unit: '万円' }],
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

test('配偶者が設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['年齢'].配偶者.push({ type: 'Age', selection: 30 });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者.年齢[currentDate]).toEqual(30);
  // 世帯の親一覧にも追加される
  expect(actual.世帯一覧.世帯1.親一覧).toEqual(['あなた', '配偶者']);
});

test('配偶者がいない場合、世帯員に配偶者は含まれない', () => {
  const context = defaultContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員).not.toHaveProperty('配偶者');
  expect(actual.世帯一覧.世帯1.親一覧).toEqual(['あなた']);
});

test('配偶者の年収が設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['年収'].配偶者.push({
    type: 'AmountOfMoney',
    selection: 300,
    unit: '万円',
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者.収入[currentDate]).toEqual(3000000);
});

test('配偶者の年収未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者).not.toHaveProperty('収入');
});

test('配偶者の預貯金が設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['預貯金'].配偶者.push({
    type: 'AmountOfMoney',
    selection: 300,
    unit: '万円',
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者.預貯金[currentDate]).toEqual(3000000);
});

test('配偶者の預貯金未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者).not.toHaveProperty('預貯金');
});

test('配偶者の仕事の種類が設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['仕事'].配偶者.push({ type: 'Selection', selection: '会社員' });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者.就労形態[currentDate]).toEqual('会社員');
});

test('配偶者の仕事の種類未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者).not.toHaveProperty('就労形態');
});

test('配偶者の6か月以内に新しい仕事を始めたかどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['6か月以内に新しい仕事を始めましたか？'].配偶者.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者.六か月以内に新規就労[currentDate]).toEqual(true);
});

test('配偶者の6か月以内に新しい仕事を始めたかどうか未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者).not.toHaveProperty('六か月以内に新規就労');
});

test('配偶者の休職中に給与の支払いがない状態かどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['休職中に給与の支払いがない状態ですか？'].配偶者.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者.休業中に給与の支払いがない[currentDate]).toEqual(
    true
  );
});

test('配偶者の休職中に給与の支払いがない状態かどうか未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者).not.toHaveProperty('休業中に給与の支払いがない');
});

test('配偶者の業務によって病気になったかどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['業務によって病気やけがをしましたか？'].配偶者.push({
    type: 'MultipleSelection',
    selection: ['業務によって病気になった'],
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者.業務によって病気になった[currentDate]).toEqual(
    true
  );
  // 別のvariableには影響しない
  expect(actual.世帯員.配偶者.業務によってけがをした[currentDate]).toEqual(
    false
  );
});

test('配偶者の業務によってけがをしたかどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['業務によって病気やけがをしましたか？'].配偶者.push({
    type: 'MultipleSelection',
    selection: ['業務によってけがをした'],
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者.業務によってけがをした[currentDate]).toEqual(
    true
  );
  // 別のvariableには影響しない
  expect(actual.世帯員.配偶者.業務によって病気になった[currentDate]).toEqual(
    false
  );
});

test('配偶者の病気によって連続三日以上休業しているかどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['病気やけがによって連続3日以上休業していますか？'].配偶者.push({
    type: 'MultipleSelection',
    selection: ['病気によって連続三日以上休業している'],
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.配偶者.病気によって連続三日以上休業している[currentDate]
  ).toEqual(true);
  // 別のvariableには影響しない
  expect(
    actual.世帯員.配偶者.けがによって連続三日以上休業している[currentDate]
  ).toEqual(false);
});

test('配偶者のけがによって連続三日以上休業しているかどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['病気やけがによって連続3日以上休業していますか？'].配偶者.push({
    type: 'MultipleSelection',
    selection: ['けがによって連続三日以上休業している'],
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.配偶者.けがによって連続三日以上休業している[currentDate]
  ).toEqual(true);
  // 別のvariableには影響しない
  expect(
    actual.世帯員.配偶者.病気によって連続三日以上休業している[currentDate]
  ).toEqual(false);
});

test('配偶者の入院中かどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['入院中ですか？'].配偶者.push({ type: 'Boolean', selection: true });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者.入院中[currentDate]).toEqual(true);
});

test('配偶者の入院中かどうか未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者).not.toHaveProperty('入院中');
});

test('配偶者の在宅療養中かどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context[
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
  ].配偶者.push({ type: 'Boolean', selection: true });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者.在宅療養中[currentDate]).toEqual(true);
});

test('配偶者の在宅療養中かどうか未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者).not.toHaveProperty('在宅療養中');
});

test('配偶者のHIV感染者であるかどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['HIVに感染していますか？'].配偶者.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者.HIV感染者である[currentDate]).toEqual(true);
});

test('配偶者のエイズを発症しているかどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['エイズを発症していますか？'].配偶者.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者.エイズを発症している[currentDate]).toEqual(true);
});

test('配偶者のエイズを発症しているかどうか未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者).not.toHaveProperty('エイズを発症している');
});

test('配偶者の家族に血液製剤によるHIV感染者がいるかどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['家族に血液製剤によってHIVに感染した方はいますか？'].配偶者.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.配偶者.家族に血液製剤によるHIV感染者がいる[currentDate]
  ).toEqual(true);
});

test('配偶者の家族に血液製剤によるHIV感染者がいるかどうか未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者).not.toHaveProperty(
    '家族に血液製剤によるHIV感染者がいる'
  );
});

test('配偶者の血液製剤の投与によってHIVに感染したかどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['血液製剤の投与によってHIVに感染しましたか？'].配偶者.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.配偶者.血液製剤の投与によってHIVに感染した[currentDate]
  ).toEqual(true);
});

test('配偶者の血液製剤の投与によってHIVに感染したかどうか未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者).not.toHaveProperty(
    '血液製剤の投与によってHIVに感染した'
  );
});

test('配偶者の血液製剤の投与によってC型肝炎ウイルスに感染したかどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context[
    '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'
  ].配偶者.push({ type: 'Boolean', selection: true });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.配偶者.血液製剤の投与によってC型肝炎ウイルスに感染した[
      currentDate
    ]
  ).toEqual(true);
});

test('配偶者の血液製剤の投与によってC型肝炎ウイルスに感染したかどうか未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者).not.toHaveProperty(
    '血液製剤の投与によってC型肝炎ウイルスに感染した'
  );
});

test('配偶者の肝硬変や肝がんに罹患しているまたは肝移植をおこなったかどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context[
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
  ].配偶者.push({ type: 'Boolean', selection: true });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.配偶者.肝硬変や肝がんに罹患しているまたは肝移植をおこなった[
      currentDate
    ]
  ).toEqual(true);
});

test('配偶者の肝硬変や肝がんに罹患しているまたは肝移植をおこなったかどうか未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者).not.toHaveProperty(
    '肝硬変や肝がんに罹患しているまたは肝移植をおこなった'
  );
});

test('配偶者の慢性腎不全かどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['慢性腎不全ですか？'].配偶者.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者.慢性腎不全である[currentDate]).toEqual(true);
});

test('配偶者の慢性腎不全かどうか未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者).not.toHaveProperty('慢性腎不全である');
});

test('配偶者の人工透析を行っているかどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['人工透析を行っていますか？'].配偶者.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者.人工透析を行っている[currentDate]).toEqual(true);
});

test('配偶者の人工透析を行っているかどうか未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者).not.toHaveProperty('人工透析を行っている');
});

test('配偶者の第I因子欠乏症かどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['血液凝固因子異常症のうち、当てはまるものはどれですか？'].配偶者.push(
    {
      type: 'MultipleSelection',
      selection: ['第I因子（フィブリノゲン）欠乏症'],
    }
  );

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.配偶者.血液凝固因子異常症_第I因子欠乏症[currentDate]
  ).toEqual(true);
  // 他の因子欠乏症は選択されない
  expect(
    actual.世帯員.配偶者.血液凝固因子異常症_フォンヴィルブランド病[currentDate]
  ).toEqual(false);
});

test('配偶者の第II因子欠乏症かどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['血液凝固因子異常症のうち、当てはまるものはどれですか？'].配偶者.push(
    {
      type: 'MultipleSelection',
      selection: ['第II因子（プロトロンビン）欠乏症'],
    }
  );

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.配偶者.血液凝固因子異常症_第II因子欠乏症[currentDate]
  ).toEqual(true);
  expect(
    actual.世帯員.配偶者.血液凝固因子異常症_第I因子欠乏症[currentDate]
  ).toEqual(false);
});

test('配偶者の第V因子欠乏症かどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['血液凝固因子異常症のうち、当てはまるものはどれですか？'].配偶者.push(
    {
      type: 'MultipleSelection',
      selection: ['第V因子（不安定因子）欠乏症'],
    }
  );

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.配偶者.血液凝固因子異常症_第V因子欠乏症[currentDate]
  ).toEqual(true);
  expect(
    actual.世帯員.配偶者.血液凝固因子異常症_第I因子欠乏症[currentDate]
  ).toEqual(false);
});

test('配偶者の第VII因子欠乏症かどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['血液凝固因子異常症のうち、当てはまるものはどれですか？'].配偶者.push(
    {
      type: 'MultipleSelection',
      selection: ['第VII因子（安定因子）欠乏症'],
    }
  );

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.配偶者.血液凝固因子異常症_第VII因子欠乏症[currentDate]
  ).toEqual(true);
  expect(
    actual.世帯員.配偶者.血液凝固因子異常症_第I因子欠乏症[currentDate]
  ).toEqual(false);
});

test('配偶者の第VIII因子欠乏症（血友病A）かどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['血液凝固因子異常症のうち、当てはまるものはどれですか？'].配偶者.push(
    {
      type: 'MultipleSelection',
      selection: ['第VIII因子欠乏症（血友病A）'],
    }
  );

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.配偶者.血液凝固因子異常症_第VIII因子欠乏症[currentDate]
  ).toEqual(true);
  expect(
    actual.世帯員.配偶者.血液凝固因子異常症_第I因子欠乏症[currentDate]
  ).toEqual(false);
});

test('配偶者の第IX因子欠乏症（血友病B）かどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['血液凝固因子異常症のうち、当てはまるものはどれですか？'].配偶者.push(
    {
      type: 'MultipleSelection',
      selection: ['第IX因子欠乏症（血友病B）'],
    }
  );

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.配偶者.血液凝固因子異常症_第IX因子欠乏症[currentDate]
  ).toEqual(true);
  expect(
    actual.世帯員.配偶者.血液凝固因子異常症_第I因子欠乏症[currentDate]
  ).toEqual(false);
});

test('配偶者の第X因子欠乏症かどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['血液凝固因子異常症のうち、当てはまるものはどれですか？'].配偶者.push(
    {
      type: 'MultipleSelection',
      selection: ['第X因子（スチュアートプラウア）欠乏症'],
    }
  );

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.配偶者.血液凝固因子異常症_第X因子欠乏症[currentDate]
  ).toEqual(true);
  expect(
    actual.世帯員.配偶者.血液凝固因子異常症_第I因子欠乏症[currentDate]
  ).toEqual(false);
});

test('配偶者の第XI因子欠乏症かどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['血液凝固因子異常症のうち、当てはまるものはどれですか？'].配偶者.push(
    {
      type: 'MultipleSelection',
      selection: ['第XI因子（PTA）欠乏症'],
    }
  );

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.配偶者.血液凝固因子異常症_第XI因子欠乏症[currentDate]
  ).toEqual(true);
  expect(
    actual.世帯員.配偶者.血液凝固因子異常症_第I因子欠乏症[currentDate]
  ).toEqual(false);
});

test('配偶者の第XII因子欠乏症かどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['血液凝固因子異常症のうち、当てはまるものはどれですか？'].配偶者.push(
    {
      type: 'MultipleSelection',
      selection: ['第XII因子（ヘイグマン因子）欠乏症'],
    }
  );

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.配偶者.血液凝固因子異常症_第XII因子欠乏症[currentDate]
  ).toEqual(true);
  expect(
    actual.世帯員.配偶者.血液凝固因子異常症_第I因子欠乏症[currentDate]
  ).toEqual(false);
});

test('配偶者の第XIII因子欠乏症かどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['血液凝固因子異常症のうち、当てはまるものはどれですか？'].配偶者.push(
    {
      type: 'MultipleSelection',
      selection: ['第XIII因子（フィブリン安定化因子）欠乏症'],
    }
  );

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.配偶者.血液凝固因子異常症_第XIII因子欠乏症[currentDate]
  ).toEqual(true);
  expect(
    actual.世帯員.配偶者.血液凝固因子異常症_第I因子欠乏症[currentDate]
  ).toEqual(false);
});

test('配偶者のフォン・ヴィルブランド病かどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['血液凝固因子異常症のうち、当てはまるものはどれですか？'].配偶者.push(
    {
      type: 'MultipleSelection',
      selection: ['Von Willebrand（フォン・ヴィルブランド）病'],
    }
  );

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.配偶者.血液凝固因子異常症_フォンヴィルブランド病[currentDate]
  ).toEqual(true);
  expect(
    actual.世帯員.配偶者.血液凝固因子異常症_第I因子欠乏症[currentDate]
  ).toEqual(false);
});

test('配偶者の血液凝固因子異常症がわからない・その他かどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['血液凝固因子異常症のうち、当てはまるものはどれですか？'].配偶者.push(
    {
      type: 'MultipleSelection',
      selection: ['わからない・その他'],
    }
  );

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者.血液凝固因子異常症_その他[currentDate]).toEqual(
    true
  );
  expect(
    actual.世帯員.配偶者.血液凝固因子異常症_第I因子欠乏症[currentDate]
  ).toEqual(false);
});

test('配偶者の身体障害者手帳が設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['身体障害者手帳を持っていますか？'].配偶者.push({
    type: 'Selection',
    selection: '1級',
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者.身体障害者手帳等級[currentDate]).toEqual('一級');
});

test('配偶者の身体障害者手帳未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者).not.toHaveProperty('身体障害者手帳等級');
});

test('配偶者の精神障害者保健福祉手帳が設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['精神障害者保健福祉手帳を持っていますか？'].配偶者.push({
    type: 'Selection',
    selection: '1級',
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者.精神障害者保健福祉手帳等級[currentDate]).toEqual(
    '一級'
  );
});

test('配偶者の精神障害者保健福祉手帳未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者).not.toHaveProperty('精神障害者保健福祉手帳等級');
});

test('配偶者の療育手帳が設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['療育手帳、または愛の手帳を持っていますか？'].配偶者.push({
    type: 'Selection',
    selection: '療育手帳 A',
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者.療育手帳等級[currentDate]).toEqual('A');
  // 持っていない方は設定されない
  expect(actual.世帯員.配偶者).not.toHaveProperty('愛の手帳等級');
});

test('配偶者の愛の手帳が設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['療育手帳、または愛の手帳を持っていますか？'].配偶者.push({
    type: 'Selection',
    selection: '愛の手帳 1度',
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者.愛の手帳等級[currentDate]).toEqual('一度');
  // 持っていない方は設定されない
  expect(actual.世帯員.配偶者).not.toHaveProperty('療育手帳等級');
});

test('配偶者の療育手帳、または愛の手帳未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者).not.toHaveProperty('療育手帳等級');
  expect(actual.世帯員.配偶者).not.toHaveProperty('愛の手帳等級');
});

test('配偶者の放射線障害があるかどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['放射線障害がありますか？'].配偶者.push({
    type: 'Selection',
    selection: '現罹患者',
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者.放射線障害[currentDate]).toEqual('現罹患者');
});

test('配偶者の放射線障害があるかどうかが設定されている（ない場合）', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['放射線障害がありますか？'].配偶者.push({
    type: 'Selection',
    selection: 'いいえ',
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者.放射線障害[currentDate]).toEqual('無');
});

test('配偶者の放射線障害未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者).not.toHaveProperty('放射線障害');
});

test('配偶者の内部障害があるかどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['内部障害（内臓などのからだの内部の障害）がありますか？'].配偶者.push(
    { type: 'Boolean', selection: true }
  );

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者.内部障害[currentDate]).toEqual('有');
});

test('配偶者の内部障害があるかどうかが設定されている（ない場合）', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['内部障害（内臓などのからだの内部の障害）がありますか？'].配偶者.push(
    { type: 'Boolean', selection: false }
  );

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者.内部障害[currentDate]).toEqual('無');
});

test('配偶者の内部障害未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者).not.toHaveProperty('内部障害');
});

test('配偶者の脳性まひ、または進行性筋萎縮症かどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['脳性まひ、または進行性筋萎縮症ですか？'].配偶者.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者.脳性まひ_進行性筋萎縮症[currentDate]).toEqual(
    '有'
  );
});

test('配偶者の脳性まひ、または進行性筋萎縮症かどうかが設定されている（ない場合）', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['脳性まひ、または進行性筋萎縮症ですか？'].配偶者.push({
    type: 'Boolean',
    selection: false,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者.脳性まひ_進行性筋萎縮症[currentDate]).toEqual(
    '無'
  );
});

test('配偶者の脳性まひ、または進行性筋萎縮症未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者).not.toHaveProperty('脳性まひ_進行性筋萎縮症');
});

test('配偶者の介護施設入所中かどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['介護施設に入所していますか？'].配偶者.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者.介護施設入所中[currentDate]).toEqual(true);
});

test('配偶者の介護施設入所中かどうか未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者).not.toHaveProperty('介護施設入所中');
});

test('配偶者の学生かどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['高校、大学、専門学校、職業訓練学校等の学生ですか？'].配偶者.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者.学生[currentDate]).toEqual(true);
});

test('配偶者の学生かどうか未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者).not.toHaveProperty('学生');
});

test('配偶者の妊娠中、または産後6ヵ月以内かどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['妊娠中、または産後6ヵ月以内ですか？'].配偶者.push({
    type: 'Selection',
    selection: '妊娠6ヵ月未満',
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者.妊産婦[currentDate]).toEqual('妊娠6ヵ月未満');
});

test('配偶者の妊娠中、または産後6ヵ月以内かどうかが設定されている（「いいえ」の場合）', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['妊娠中、または産後6ヵ月以内ですか？'].配偶者.push({
    type: 'Selection',
    selection: 'いいえ',
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者.妊産婦[currentDate]).toEqual('無');
});

test('配偶者の妊娠中、または産後6ヵ月以内かどうか未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者).not.toHaveProperty('妊産婦');
});

test('ひとり親に該当するかどうかが設定されている', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['以下のいずれかに当てはまりますか？'].配偶者.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯一覧.世帯1.配偶者がいるがひとり親に該当?.[currentDate]
  ).toEqual(true);
});

test('ひとり親に該当するかどうか未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['配偶者はいますか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者).not.toHaveProperty(
    '以下のいずれかに当てはまりますか？'
  );
});

// 子ども

test('子ども1人の場合、子ども1が世帯員に追加されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員).toHaveProperty('子ども1');
  // 世帯の子ども一覧にも追加される
  expect(actual.世帯一覧.世帯1.子一覧).toEqual(['子ども1']);
});

test('子ども2人の場合、子ども1・子ども2が世帯員に追加されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 2;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員).toHaveProperty('子ども1');
  expect(actual.世帯員).toHaveProperty('子ども2');
  expect(actual.世帯一覧.世帯1.子一覧).toEqual(['子ども1', '子ども2']);
});

test('子どもの人数未回答の場合、子ども世帯員は追加されない', () => {
  const context = defaultContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員).not.toHaveProperty('子ども1');
  expect(actual.世帯一覧.世帯1.子一覧).toEqual([]);
});

test('子どもの年齢が設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['年齢'].子ども.push({ type: 'Age', selection: 10 });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.誕生年月日.ETERNITY).toEqual('2016-01-01');
});

test('子どもの年齢が未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1).not.toHaveProperty('誕生年月日');
});

test('子どもの年収が設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['年収'].子ども.push({
    type: 'AmountOfMoney',
    selection: 100,
    unit: '万円',
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.収入[currentDate]).toEqual(1000000);
});

// 子どもの年収は仕事がある場合のみ回答するが、未回答であってもOpenFisca上は設定される必要がある
test('子どもの年収が未回答の場合0円', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.収入[currentDate]).toEqual(0);
});

test('子どもの預貯金が設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['預貯金'].子ども.push({
    type: 'AmountOfMoney',
    selection: 50,
    unit: '万円',
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.預貯金[currentDate]).toEqual(500000);
});

test('子どもの預貯金が未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1).not.toHaveProperty('預貯金');
});

test('通っている高校の種類を選んでください（1）が設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['通っている高校の種類を選んでください（1）'].子ども.push({
    type: 'Selection',
    selection: '全日制課程',
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.高校履修種別[currentDate]).toEqual('全日制課程');
});

test('通っている高校の種類を選んでください（1）が未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1).not.toHaveProperty(
    '通っている高校の種類を選んでください（1）'
  );
});

test('高校運営種別が設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['通っている高校の種類を選んでください（2）'].子ども.push({
    type: 'Selection',
    selection: '私立',
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.高校運営種別[currentDate]).toEqual('私立');
});

test('高校運営種別が未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1).not.toHaveProperty('高校運営種別');
});

test('子どもの仕事が設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['仕事'].子ども.push({ type: 'Selection', selection: '会社員' });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.就労形態[currentDate]).toEqual('会社員');
});

test('子どもの仕事が未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1).not.toHaveProperty('就労形態');
});

test('子どもが6か月以内に新しい仕事を始めたかどうかが設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['6か月以内に新しい仕事を始めましたか？'].子ども.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.六か月以内に新規就労[currentDate]).toEqual(true);
});

test('子どもが6か月以内に新しい仕事を始めたかどうかが未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1).not.toHaveProperty('六か月以内に新規就労');
});

test('子どもの休業中に給与の支払いがない状態かどうかが設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['休職中に給与の支払いがない状態ですか？'].子ども.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.休業中に給与の支払いがない[currentDate]).toEqual(
    true
  );
});

test('子どもの休業中に給与の支払いがない状態かどうかが未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1).not.toHaveProperty(
    '休業中に給与の支払いがない'
  );
});

test('子どもが業務によって病気になったかどうかが設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['業務によって病気やけがをしましたか？'].子ども.push({
    type: 'MultipleSelection',
    selection: ['業務によって病気になった'],
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.業務によって病気になった[currentDate]).toEqual(
    true
  );
  expect(actual.世帯員.子ども1.業務によってけがをした[currentDate]).toEqual(
    false
  );
});

test('子どもが業務によってけがをしたかどうかが設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['業務によって病気やけがをしましたか？'].子ども.push({
    type: 'MultipleSelection',
    selection: ['業務によってけがをした'],
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.業務によって病気になった[currentDate]).toEqual(
    false
  );
  expect(actual.世帯員.子ども1.業務によってけがをした[currentDate]).toEqual(
    true
  );
});

test('子どもが業務による病気・けがの回答がない場合falseで設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.業務によって病気になった[currentDate]).toEqual(
    false
  );
  expect(actual.世帯員.子ども1.業務によってけがをした[currentDate]).toEqual(
    false
  );
});

test('子どもが病気によって連続三日以上休業しているかどうかが設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['病気やけがによって連続3日以上休業していますか？'].子ども.push({
    type: 'MultipleSelection',
    selection: ['病気によって連続三日以上休業している'],
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.子ども1.病気によって連続三日以上休業している[currentDate]
  ).toEqual(true);
  expect(
    actual.世帯員.子ども1.けがによって連続三日以上休業している[currentDate]
  ).toEqual(false);
});

test('子どもがけがによって連続三日以上休業しているかどうかが設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['病気やけがによって連続3日以上休業していますか？'].子ども.push({
    type: 'MultipleSelection',
    selection: ['けがによって連続三日以上休業している'],
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.子ども1.病気によって連続三日以上休業している[currentDate]
  ).toEqual(false);
  expect(
    actual.世帯員.子ども1.けがによって連続三日以上休業している[currentDate]
  ).toEqual(true);
});

test('子どもの病気・けがによる休業の回答がない場合falseで設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.子ども1.病気によって連続三日以上休業している[currentDate]
  ).toEqual(false);
  expect(
    actual.世帯員.子ども1.けがによって連続三日以上休業している[currentDate]
  ).toEqual(false);
});

test('子どもの入院中かどうかが設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['入院中ですか？'].子ども.push({ type: 'Boolean', selection: true });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.入院中[currentDate]).toEqual(true);
});

test('子どもの入院中かどうかが未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1).not.toHaveProperty('入院中');
});

test('子どもの在宅療養中かどうかが設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context[
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
  ].子ども.push({ type: 'Boolean', selection: true });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.在宅療養中[currentDate]).toEqual(true);
});

test('子どもの在宅療養中かどうかが未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1).not.toHaveProperty('在宅療養中');
});

test('子どものHIV感染者かどうかが設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['HIVに感染していますか？'].子ども.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.HIV感染者である[currentDate]).toEqual(true);
});

test('子どものHIV感染の回答がない場合falseで設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.HIV感染者である[currentDate]).toEqual(false);
});

test('子どものエイズ発症かどうかが設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['エイズを発症していますか？'].子ども.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.エイズを発症している[currentDate]).toEqual(true);
});

test('子どものエイズ発症が未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1).not.toHaveProperty('エイズを発症している');
});

test('子どもの家族に血液製剤によるHIV感染者がいるかどうかが設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['家族に血液製剤によってHIVに感染した方はいますか？'].子ども.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.子ども1.家族に血液製剤によるHIV感染者がいる[currentDate]
  ).toEqual(true);
});

test('子どもの家族に血液製剤によるHIV感染者がいるかどうかが未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1).not.toHaveProperty(
    '家族に血液製剤によるHIV感染者がいる'
  );
});

test('子どもが血液製剤の投与によってHIVに感染したかどうかが設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['血液製剤の投与によってHIVに感染しましたか？'].子ども.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.子ども1.血液製剤の投与によってHIVに感染した[currentDate]
  ).toEqual(true);
});

test('子どもが血液製剤の投与によってHIVに感染したかどうかが未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1).not.toHaveProperty(
    '血液製剤の投与によってHIVに感染した'
  );
});

test('子どもが血液製剤の投与によってC型肝炎ウイルスに感染したかどうかが設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context[
    '血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'
  ].子ども.push({ type: 'Boolean', selection: true });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.子ども1.血液製剤の投与によってC型肝炎ウイルスに感染した[
      currentDate
    ]
  ).toEqual(true);
});

test('子どもが血液製剤の投与によってC型肝炎ウイルスに感染したかどうかが未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1).not.toHaveProperty(
    '血液製剤の投与によってC型肝炎ウイルスに感染した'
  );
});

test('子どもが肝硬変や肝がんに罹患しているまたは肝移植をおこなったかどうかが設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context[
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
  ].子ども.push({ type: 'Boolean', selection: true });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.子ども1.肝硬変や肝がんに罹患しているまたは肝移植をおこなった[
      currentDate
    ]
  ).toEqual(true);
});

test('子どもが肝硬変や肝がんに罹患しているまたは肝移植をおこなったかどうかが未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1).not.toHaveProperty(
    '肝硬変や肝がんに罹患しているまたは肝移植をおこなった'
  );
});

test('子どもの慢性腎不全かどうかが設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['慢性腎不全ですか？'].子ども.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.慢性腎不全である[currentDate]).toEqual(true);
});

test('子どもの慢性腎不全かどうかが未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1).not.toHaveProperty('慢性腎不全である');
});

test('子どもの人工透析を行っているかどうかが設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['人工透析を行っていますか？'].子ども.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.人工透析を行っている[currentDate]).toEqual(true);
});

test('子どもの人工透析を行っているかどうかが未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1).not.toHaveProperty('人工透析を行っている');
});

test('子どもの血液凝固因子異常症（第VIII因子欠乏症）かどうかが設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['血液凝固因子異常症のうち、当てはまるものはどれですか？'].子ども.push(
    {
      type: 'MultipleSelection',
      selection: ['第VIII因子欠乏症（血友病A）'],
    }
  );

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.子ども1.血液凝固因子異常症_第VIII因子欠乏症[currentDate]
  ).toEqual(true);
  expect(
    actual.世帯員.子ども1.血液凝固因子異常症_第I因子欠乏症[currentDate]
  ).toEqual(false);
});

test('子どもの血液凝固因子異常症の回答がない場合すべてfalseで設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.子ども1.血液凝固因子異常症_第I因子欠乏症[currentDate]
  ).toEqual(false);
  expect(
    actual.世帯員.子ども1.血液凝固因子異常症_第VIII因子欠乏症[currentDate]
  ).toEqual(false);
});

test('子どもの身体障害者手帳等級が設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['身体障害者手帳を持っていますか？'].子ども.push({
    type: 'Selection',
    selection: '1級',
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.身体障害者手帳等級[currentDate]).toEqual('一級');
});

test('子どもの身体障害者手帳等級が未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1).not.toHaveProperty('身体障害者手帳等級');
});

test('子どもの精神障害者保健福祉手帳等級が設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['精神障害者保健福祉手帳を持っていますか？'].子ども.push({
    type: 'Selection',
    selection: '2級',
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.精神障害者保健福祉手帳等級[currentDate]).toEqual(
    '二級'
  );
});

test('子どもの精神障害者保健福祉手帳等級が未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1).not.toHaveProperty(
    '精神障害者保健福祉手帳等級'
  );
});

test('子どもの療育手帳等級が設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['療育手帳、または愛の手帳を持っていますか？'].子ども.push({
    type: 'Selection',
    selection: '療育手帳 A',
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.療育手帳等級[currentDate]).toEqual('A');
});

test('子どもの愛の手帳等級が設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['療育手帳、または愛の手帳を持っていますか？'].子ども.push({
    type: 'Selection',
    selection: '愛の手帳 2度',
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.愛の手帳等級[currentDate]).toEqual('二度');
});

test('子どもの療育手帳・愛の手帳が未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1).not.toHaveProperty('療育手帳等級');
  expect(actual.世帯員.子ども1).not.toHaveProperty('愛の手帳等級');
});

test('子どもの放射線障害が設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['放射線障害がありますか？'].子ども.push({
    type: 'Selection',
    selection: '現罹患者',
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.放射線障害[currentDate]).toEqual('現罹患者');
});

test('子どもの放射線障害が「いいえ」の場合「無」に変換される', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['放射線障害がありますか？'].子ども.push({
    type: 'Selection',
    selection: 'いいえ',
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.放射線障害[currentDate]).toEqual('無');
});

test('子どもの放射線障害が未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1).not.toHaveProperty('放射線障害');
});

test('子どもの内部障害かどうかが設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['内部障害（内臓などのからだの内部の障害）がありますか？'].子ども.push(
    {
      type: 'Boolean',
      selection: true,
    }
  );

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.内部障害[currentDate]).toEqual('有');
});

test('子どもの内部障害がfalseの場合「無」が設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['内部障害（内臓などのからだの内部の障害）がありますか？'].子ども.push(
    {
      type: 'Boolean',
      selection: false,
    }
  );

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.内部障害[currentDate]).toEqual('無');
});

test('子どもの内部障害が未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1).not.toHaveProperty('内部障害');
});

test('子どもの脳性まひ・進行性筋萎縮症かどうかが設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['脳性まひ、または進行性筋萎縮症ですか？'].子ども.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.脳性まひ_進行性筋萎縮症[currentDate]).toEqual(
    '有'
  );
});

test('子どもの脳性まひ・進行性筋萎縮症がfalseの場合「無」が設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['脳性まひ、または進行性筋萎縮症ですか？'].子ども.push({
    type: 'Boolean',
    selection: false,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.脳性まひ_進行性筋萎縮症[currentDate]).toEqual(
    '無'
  );
});

test('子どもの脳性まひ・進行性筋萎縮症が未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1).not.toHaveProperty('脳性まひ_進行性筋萎縮症');
});

test('子どもの介護施設入所中かどうかが設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['介護施設に入所していますか？'].子ども.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.介護施設入所中[currentDate]).toEqual(true);
});

test('子どもの介護施設入所中かどうかが未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1).not.toHaveProperty('介護施設入所中');
});

test('2人目の子どもの通っている高校の種類を選んでください（1）が設定されている', () => {
  const context = defaultContext();
  context['子どもの人数'].あなた[0].selection = 2;
  context['通っている高校の種類を選んでください（1）'].子ども.push(
    { type: 'Selection', selection: '全日制課程' },
    { type: 'Selection', selection: '定時制課程' }
  );

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.高校履修種別[currentDate]).toEqual('全日制課程');
  expect(actual.世帯員.子ども2.高校履修種別[currentDate]).toEqual('定時制課程');
});

test('親1人の場合、親1が世帯員に追加されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員).toHaveProperty('親1');
  // 世帯の祖父母一覧にも追加される
  expect(actual.世帯一覧.世帯1.祖父母一覧).toEqual(['親1']);
});

test('親2人の場合、親1・親2が世帯員に追加されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 2;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員).toHaveProperty('親1');
  expect(actual.世帯員).toHaveProperty('親2');
  expect(actual.世帯一覧.世帯1.祖父母一覧).toEqual(['親1', '親2']);
});

test('親の人数未回答の場合、親世帯員は追加されない', () => {
  const context = defaultContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員).not.toHaveProperty('親1');
  expect(actual.世帯一覧.世帯1.祖父母一覧).toEqual([]);
});

test('親の年齢が設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context['年齢'].親.push({ type: 'Age', selection: 60 });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.誕生年月日.ETERNITY).toEqual('1966-01-01');
});

test('親の年齢が未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1).not.toHaveProperty('誕生年月日');
});

test('親の年収が設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context['年収'].親.push({
    type: 'AmountOfMoney',
    selection: 100,
    unit: '万円',
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.収入[currentDate]).toEqual(1000000);
});

test('親の年収が未回答の場合0円', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.収入[currentDate]).toEqual(0);
});

test('親の預貯金が設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context['預貯金'].親.push({
    type: 'AmountOfMoney',
    selection: 50,
    unit: '万円',
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.預貯金[currentDate]).toEqual(500000);
});

test('親の預貯金が未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1).not.toHaveProperty('預貯金');
});

test('親の仕事が設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context['仕事'].親.push({ type: 'Selection', selection: '会社員' });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.就労形態[currentDate]).toEqual('会社員');
});

test('親の仕事が未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1).not.toHaveProperty('就労形態');
});

test('親が6か月以内に新しい仕事を始めたかどうかが設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context['6か月以内に新しい仕事を始めましたか？'].親.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.六か月以内に新規就労[currentDate]).toEqual(true);
});

test('親が6か月以内に新しい仕事を始めたかどうかが未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1).not.toHaveProperty('六か月以内に新規就労');
});

test('親の休業中に給与の支払いがない状態かどうかが設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context['休職中に給与の支払いがない状態ですか？'].親.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.休業中に給与の支払いがない[currentDate]).toEqual(
    true
  );
});

test('親の休業中に給与の支払いがない状態かどうかが未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1).not.toHaveProperty('休業中に給与の支払いがない');
});

test('親が業務によって病気になったかどうかが設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context['業務によって病気やけがをしましたか？'].親.push({
    type: 'MultipleSelection',
    selection: ['業務によって病気になった'],
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.業務によって病気になった[currentDate]).toEqual(true);
  expect(actual.世帯員.親1.業務によってけがをした[currentDate]).toEqual(false);
});

test('親が業務によってけがをしたかどうかが設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context['業務によって病気やけがをしましたか？'].親.push({
    type: 'MultipleSelection',
    selection: ['業務によってけがをした'],
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.業務によって病気になった[currentDate]).toEqual(
    false
  );
  expect(actual.世帯員.親1.業務によってけがをした[currentDate]).toEqual(true);
});

test('親が業務による病気・けがの回答がない場合falseで設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.業務によって病気になった[currentDate]).toEqual(
    false
  );
  expect(actual.世帯員.親1.業務によってけがをした[currentDate]).toEqual(false);
});

test('親が病気によって連続三日以上休業しているかどうかが設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context['病気やけがによって連続3日以上休業していますか？'].親.push({
    type: 'MultipleSelection',
    selection: ['病気によって連続三日以上休業している'],
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.親1.病気によって連続三日以上休業している[currentDate]
  ).toEqual(true);
  expect(
    actual.世帯員.親1.けがによって連続三日以上休業している[currentDate]
  ).toEqual(false);
});

test('親がけがによって連続三日以上休業しているかどうかが設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context['病気やけがによって連続3日以上休業していますか？'].親.push({
    type: 'MultipleSelection',
    selection: ['けがによって連続三日以上休業している'],
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.親1.病気によって連続三日以上休業している[currentDate]
  ).toEqual(false);
  expect(
    actual.世帯員.親1.けがによって連続三日以上休業している[currentDate]
  ).toEqual(true);
});

test('親の病気・けがによる休業の回答がない場合falseで設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.親1.病気によって連続三日以上休業している[currentDate]
  ).toEqual(false);
  expect(
    actual.世帯員.親1.けがによって連続三日以上休業している[currentDate]
  ).toEqual(false);
});

test('親の入院中かどうかが設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context['入院中ですか？'].親.push({ type: 'Boolean', selection: true });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.入院中[currentDate]).toEqual(true);
});

test('親の入院中かどうかが未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1).not.toHaveProperty('入院中');
});

test('親の在宅療養中かどうかが設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context[
    '在宅療養中（結核、または治療に3か月以上かかるもの）ですか？'
  ].親.push({ type: 'Boolean', selection: true });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.在宅療養中[currentDate]).toEqual(true);
});

test('親の在宅療養中かどうかが未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1).not.toHaveProperty('在宅療養中');
});

test('親のHIV感染者かどうかが設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context['HIVに感染していますか？'].親.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.HIV感染者である[currentDate]).toEqual(true);
});

test('親のHIV感染の回答がない場合falseで設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.HIV感染者である[currentDate]).toEqual(false);
});

test('親のエイズ発症かどうかが設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context['エイズを発症していますか？'].親.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.エイズを発症している[currentDate]).toEqual(true);
});

test('親のエイズ発症が未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1).not.toHaveProperty('エイズを発症している');
});

test('親の家族に血液製剤によるHIV感染者がいるかどうかが設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context['家族に血液製剤によってHIVに感染した方はいますか？'].親.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.親1.家族に血液製剤によるHIV感染者がいる[currentDate]
  ).toEqual(true);
});

test('親の家族に血液製剤によるHIV感染者がいるかどうかが未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1).not.toHaveProperty(
    '家族に血液製剤によるHIV感染者がいる'
  );
});

test('親が血液製剤の投与によってHIVに感染したかどうかが設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context['血液製剤の投与によってHIVに感染しましたか？'].親.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.親1.血液製剤の投与によってHIVに感染した[currentDate]
  ).toEqual(true);
});

test('親が血液製剤の投与によってHIVに感染したかどうかが未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1).not.toHaveProperty(
    '血液製剤の投与によってHIVに感染した'
  );
});

test('親が血液製剤の投与によってC型肝炎ウイルスに感染したかどうかが設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context['血液製剤の投与によってC型肝炎ウイルスに感染しましたか？'].親.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.親1.血液製剤の投与によってC型肝炎ウイルスに感染した[
      currentDate
    ]
  ).toEqual(true);
});

test('親が血液製剤の投与によってC型肝炎ウイルスに感染したかどうかが未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1).not.toHaveProperty(
    '血液製剤の投与によってC型肝炎ウイルスに感染した'
  );
});

test('親が肝硬変や肝がんに罹患しているまたは肝移植をおこなったかどうかが設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context[
    '肝硬変や肝がんにかかっていますか？または肝移植をおこないましたか？'
  ].親.push({ type: 'Boolean', selection: true });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.親1.肝硬変や肝がんに罹患しているまたは肝移植をおこなった[
      currentDate
    ]
  ).toEqual(true);
});

test('親が肝硬変や肝がんに罹患しているまたは肝移植をおこなったかどうかが未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1).not.toHaveProperty(
    '肝硬変や肝がんに罹患しているまたは肝移植をおこなった'
  );
});

test('親の慢性腎不全かどうかが設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context['慢性腎不全ですか？'].親.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.慢性腎不全である[currentDate]).toEqual(true);
});

test('親の慢性腎不全かどうかが未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1).not.toHaveProperty('慢性腎不全である');
});

test('親の人工透析を行っているかどうかが設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context['人工透析を行っていますか？'].親.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.人工透析を行っている[currentDate]).toEqual(true);
});

test('親の人工透析を行っているかどうかが未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1).not.toHaveProperty('人工透析を行っている');
});

test('親の血液凝固因子異常症（第VIII因子欠乏症）かどうかが設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context['血液凝固因子異常症のうち、当てはまるものはどれですか？'].親.push({
    type: 'MultipleSelection',
    selection: ['第VIII因子欠乏症（血友病A）'],
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.親1.血液凝固因子異常症_第VIII因子欠乏症[currentDate]
  ).toEqual(true);
  expect(
    actual.世帯員.親1.血液凝固因子異常症_第I因子欠乏症[currentDate]
  ).toEqual(false);
});

test('親の血液凝固因子異常症の回答がない場合すべてfalseで設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.親1.血液凝固因子異常症_第I因子欠乏症[currentDate]
  ).toEqual(false);
  expect(
    actual.世帯員.親1.血液凝固因子異常症_第VIII因子欠乏症[currentDate]
  ).toEqual(false);
});

test('親の身体障害者手帳等級が設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context['身体障害者手帳を持っていますか？'].親.push({
    type: 'Selection',
    selection: '1級',
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.身体障害者手帳等級[currentDate]).toEqual('一級');
});

test('親の身体障害者手帳等級が未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1).not.toHaveProperty('身体障害者手帳等級');
});

test('親の精神障害者保健福祉手帳等級が設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context['精神障害者保健福祉手帳を持っていますか？'].親.push({
    type: 'Selection',
    selection: '2級',
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.精神障害者保健福祉手帳等級[currentDate]).toEqual(
    '二級'
  );
});

test('親の精神障害者保健福祉手帳等級が未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1).not.toHaveProperty('精神障害者保健福祉手帳等級');
});

test('親の療育手帳等級が設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context['療育手帳、または愛の手帳を持っていますか？'].親.push({
    type: 'Selection',
    selection: '療育手帳 A',
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.療育手帳等級[currentDate]).toEqual('A');
});

test('親の愛の手帳等級が設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context['療育手帳、または愛の手帳を持っていますか？'].親.push({
    type: 'Selection',
    selection: '愛の手帳 2度',
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.愛の手帳等級[currentDate]).toEqual('二度');
});

test('親の療育手帳・愛の手帳が未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1).not.toHaveProperty('療育手帳等級');
  expect(actual.世帯員.親1).not.toHaveProperty('愛の手帳等級');
});

test('親の放射線障害が設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context['放射線障害がありますか？'].親.push({
    type: 'Selection',
    selection: '現罹患者',
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.放射線障害[currentDate]).toEqual('現罹患者');
});

test('親の放射線障害が「いいえ」の場合「無」に変換される', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context['放射線障害がありますか？'].親.push({
    type: 'Selection',
    selection: 'いいえ',
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.放射線障害[currentDate]).toEqual('無');
});

test('親の放射線障害が未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1).not.toHaveProperty('放射線障害');
});

test('親の内部障害かどうかが設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context['内部障害（内臓などのからだの内部の障害）がありますか？'].親.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.内部障害[currentDate]).toEqual('有');
});

test('親の内部障害がfalseの場合「無」が設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context['内部障害（内臓などのからだの内部の障害）がありますか？'].親.push({
    type: 'Boolean',
    selection: false,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.内部障害[currentDate]).toEqual('無');
});

test('親の内部障害が未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1).not.toHaveProperty('内部障害');
});

test('親の脳性まひ・進行性筋萎縮症かどうかが設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context['脳性まひ、または進行性筋萎縮症ですか？'].親.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.脳性まひ_進行性筋萎縮症[currentDate]).toEqual('有');
});

test('親の脳性まひ・進行性筋萎縮症がfalseの場合「無」が設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context['脳性まひ、または進行性筋萎縮症ですか？'].親.push({
    type: 'Boolean',
    selection: false,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.脳性まひ_進行性筋萎縮症[currentDate]).toEqual('無');
});

test('親の脳性まひ・進行性筋萎縮症が未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1).not.toHaveProperty('脳性まひ_進行性筋萎縮症');
});

test('親の介護施設入所中かどうかが設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context['介護施設に入所していますか？'].親.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.介護施設入所中[currentDate]).toEqual(true);
});

test('親の介護施設入所中かどうかが未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1).not.toHaveProperty('介護施設入所中');
});

test('親の学生かどうかが設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;
  context['高校、大学、専門学校、職業訓練学校等の学生ですか？'].親.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.学生[currentDate]).toEqual(true);
});

test('親の学生かどうかが未回答の場合設定されていない', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1).not.toHaveProperty('学生');
});

test('2人目の親の年齢が設定されている', () => {
  const context = defaultContext();
  context['親の人数'].あなた[0].selection = 2;
  context['年齢'].親.push(
    { type: 'Age', selection: 60 },
    { type: 'Age', selection: 55 }
  );

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.誕生年月日.ETERNITY).toEqual('1966-01-01');
  expect(actual.世帯員.親2.誕生年月日.ETERNITY).toEqual('1971-01-01');
});

// 能登半島地震被災者支援制度見積もり用

const disasterContext = (): QuestionStateContext => {
  const context = defaultContext();
  context['見積もりモード'].あなた[0].selection =
    '能登半島地震被災者支援制度見積もり';
  return context;
};

test('災害モードの場合、被災しているフラグが設定される', () => {
  const context = disasterContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯一覧.世帯1.被災している![currentDate]).toEqual(true);
  expect(
    actual.世帯一覧.世帯1.災害救助法の適用地域である![currentDate]
  ).toEqual(true);
  expect(
    actual.世帯一覧.世帯1.被災者生活再建支援法の適用地域である![currentDate]
  ).toEqual(true);
});

test('通常モードの場合、被災しているフラグが設定されない', () => {
  const context = defaultContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯一覧.世帯1).not.toHaveProperty('被災している');
  expect(actual.世帯一覧.世帯1).not.toHaveProperty(
    '災害救助法の適用地域である'
  );
  expect(actual.世帯一覧.世帯1).not.toHaveProperty(
    '被災者生活再建支援法の適用地域である'
  );
});

test('あなたの被災前の年収が収入に変換される', () => {
  const context = disasterContext();
  context['被災前の年収'].あなた[0].selection = 200;
  context['被災前の年収'].あなた[0].unit = '万円';

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた.収入[currentDate]).toEqual(2000000);
});

test('住宅被害の状況が設定されている（表示値 → API値変換なし）', () => {
  const context = disasterContext();
  context[
    '住宅被害の状況（当てはまるもののうち最も上のものを選んでください）'
  ].あなた[0].selection = '滅失または流失';

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯一覧.世帯1.住宅被害![currentDate]).toEqual(
    '滅失または流失'
  );
});

test('住宅被害の状況が設定されている（全壊の表示値 → API値変換）', () => {
  const context = disasterContext();
  context[
    '住宅被害の状況（当てはまるもののうち最も上のものを選んでください）'
  ].あなた[0].selection = '全壊（損害割合50%以上）';

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯一覧.世帯1.住宅被害![currentDate]).toEqual('全壊');
});

test('住宅被害の状況が設定されている（大規模半壊の表示値 → API値変換）', () => {
  const context = disasterContext();
  context[
    '住宅被害の状況（当てはまるもののうち最も上のものを選んでください）'
  ].あなた[0].selection = '大規模半壊（損害割合40%台）';

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯一覧.世帯1.住宅被害![currentDate]).toEqual('大規模半壊');
});

test('住宅被害の状況が設定されている（中規模半壊の表示値 → API値変換）', () => {
  const context = disasterContext();
  context[
    '住宅被害の状況（当てはまるもののうち最も上のものを選んでください）'
  ].あなた[0].selection = '中規模半壊（損害割合30%台）';

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯一覧.世帯1.住宅被害![currentDate]).toEqual('中規模半壊');
});

test('住宅被害の状況が未回答の場合設定されない', () => {
  const context = disasterContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯一覧.世帯1).not.toHaveProperty('住宅被害');
});

test('住宅再建方法が設定されている', () => {
  const context = disasterContext();
  context['住宅再建方法'].あなた[0].selection = '建設または購入';

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯一覧.世帯1.住宅再建方法![currentDate]).toEqual(
    '建設または購入'
  );
});

test('住宅再建方法が未回答の場合設定されない', () => {
  const context = disasterContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯一覧.世帯1).not.toHaveProperty('住宅再建方法');
});

test('家財の損害ありの場合「三分の一以上」に変換される', () => {
  const context = disasterContext();
  context['家財の３分の１以上の損害が発生しましたか？'].あなた[0].selection =
    true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯一覧.世帯1.家財の損害![currentDate]).toEqual(
    '三分の一以上'
  );
});

test('家財の損害なしの場合「無」に変換される', () => {
  const context = disasterContext();
  context['家財の３分の１以上の損害が発生しましたか？'].あなた[0].selection =
    false;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯一覧.世帯1.家財の損害![currentDate]).toEqual('無');
});

test('家財の損害が未回答の場合設定されない', () => {
  const context = disasterContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯一覧.世帯1).not.toHaveProperty('家財の損害');
});

test('災害で死亡した世帯員の人数が設定されている', () => {
  const context = disasterContext();
  context['家族に災害で亡くなった方はいますか？'].あなた[0].selection = 2;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯一覧.世帯1.災害で死亡した世帯員の人数![currentDate]
  ).toEqual(2);
});

test('災害で死亡した世帯員の人数が未回答の場合設定されない', () => {
  const context = disasterContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯一覧.世帯1).not.toHaveProperty(
    '災害で死亡した世帯員の人数'
  );
});

test('災害で生計維持者が亡くなったかどうかが設定されている', () => {
  const context = disasterContext();
  context['災害で生計維持者が亡くなりましたか？'].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯一覧.世帯1.災害で生計維持者が死亡した![currentDate]
  ).toEqual(true);
});

test('災害で生計維持者が亡くなったかどうかが未回答の場合設定されない', () => {
  const context = disasterContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯一覧.世帯1).not.toHaveProperty(
    '災害で生計維持者が死亡した'
  );
});

test('あなたの災害による負傷（1ヶ月以上療養）ありの場合「一か月以上」に変換される', () => {
  const context = disasterContext();
  context[
    '災害により負傷し、1ヶ月以上療養を続けていますか？'
  ].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた.災害による負傷の療養期間[currentDate]).toEqual(
    '一か月以上'
  );
});

test('あなたの災害による負傷なしの場合「無」に変換される', () => {
  const context = disasterContext();
  context[
    '災害により負傷し、1ヶ月以上療養を続けていますか？'
  ].あなた[0].selection = false;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた.災害による負傷の療養期間[currentDate]).toEqual(
    '無'
  );
});

test('あなたの災害による負傷が未回答の場合設定されない', () => {
  const context = disasterContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた).not.toHaveProperty('災害による負傷の療養期間');
});

test('あなたの災害による重い障害が設定されている', () => {
  const context = disasterContext();
  context[
    '災害によって、精神または身体に重い障害がありますか？'
  ].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.あなた.災害による重い後遺障害がある[currentDate]
  ).toEqual(true);
});

test('あなたの災害による重い障害が未回答の場合設定されない', () => {
  const context = disasterContext();

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた).not.toHaveProperty(
    '災害による重い後遺障害がある'
  );
});

test('通常モードの場合、あなたの災害による負傷・障害は設定されない', () => {
  const context = defaultContext();
  context[
    '災害により負傷し、1ヶ月以上療養を続けていますか？'
  ].あなた[0].selection = true;
  context[
    '災害によって、精神または身体に重い障害がありますか？'
  ].あなた[0].selection = true;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.あなた).not.toHaveProperty('災害による負傷の療養期間');
  expect(actual.世帯員.あなた).not.toHaveProperty(
    '災害による重い後遺障害がある'
  );
});

test('配偶者の被災前の年収が収入に変換される', () => {
  const context = disasterContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['被災前の年収'].配偶者.push({
    type: 'AmountOfMoney',
    selection: 200,
    unit: '万円',
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者.収入[currentDate]).toEqual(2000000);
});

test('配偶者の災害による負傷（1ヶ月以上療養）ありの場合「一か月以上」に変換される', () => {
  const context = disasterContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['災害により負傷し、1ヶ月以上療養を続けていますか？'].配偶者.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者.災害による負傷の療養期間[currentDate]).toEqual(
    '一か月以上'
  );
});

test('配偶者の災害による負傷なしの場合「無」に変換される', () => {
  const context = disasterContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['災害により負傷し、1ヶ月以上療養を続けていますか？'].配偶者.push({
    type: 'Boolean',
    selection: false,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.配偶者.災害による負傷の療養期間[currentDate]).toEqual(
    '無'
  );
});

test('配偶者の災害による重い障害が設定されている', () => {
  const context = disasterContext();
  context['配偶者はいますか？'].あなた[0].selection = true;
  context['災害によって、精神または身体に重い障害がありますか？'].配偶者.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.配偶者.災害による重い後遺障害がある[currentDate]
  ).toEqual(true);
});

test('子どもの被災前の年収が収入に変換される', () => {
  const context = disasterContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['被災前の年収'].子ども.push({
    type: 'AmountOfMoney',
    selection: 200,
    unit: '万円',
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.収入[currentDate]).toEqual(2000000);
});

test('子どもの災害による負傷（1ヶ月以上療養）ありの場合「一か月以上」に変換される', () => {
  const context = disasterContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['災害により負傷し、1ヶ月以上療養を続けていますか？'].子ども.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.災害による負傷の療養期間[currentDate]).toEqual(
    '一か月以上'
  );
});

test('子どもの災害による負傷なしの場合「無」に変換される', () => {
  const context = disasterContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['災害により負傷し、1ヶ月以上療養を続けていますか？'].子ども.push({
    type: 'Boolean',
    selection: false,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1.災害による負傷の療養期間[currentDate]).toEqual(
    '無'
  );
});

test('子どもの災害による重い障害が設定されている', () => {
  const context = disasterContext();
  context['子どもの人数'].あなた[0].selection = 1;
  context['災害によって、精神または身体に重い障害がありますか？'].子ども.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(
    actual.世帯員.子ども1.災害による重い後遺障害がある[currentDate]
  ).toEqual(true);
});

test('子どもの災害による負傷が未回答の場合設定されない', () => {
  const context = disasterContext();
  context['子どもの人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.子ども1).not.toHaveProperty('災害による負傷の療養期間');
});

test('親の被災前の年収が収入に変換される', () => {
  const context = disasterContext();
  context['親の人数'].あなた[0].selection = 1;
  context['被災前の年収'].親.push({
    type: 'AmountOfMoney',
    selection: 200,
    unit: '万円',
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.収入[currentDate]).toEqual(2000000);
});

test('親の災害による負傷（1ヶ月以上療養）ありの場合「一か月以上」に変換される', () => {
  const context = disasterContext();
  context['親の人数'].あなた[0].selection = 1;
  context['災害により負傷し、1ヶ月以上療養を続けていますか？'].親.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.災害による負傷の療養期間[currentDate]).toEqual(
    '一か月以上'
  );
});

test('親の災害による負傷なしの場合「無」に変換される', () => {
  const context = disasterContext();
  context['親の人数'].あなた[0].selection = 1;
  context['災害により負傷し、1ヶ月以上療養を続けていますか？'].親.push({
    type: 'Boolean',
    selection: false,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.災害による負傷の療養期間[currentDate]).toEqual('無');
});

test('親の災害による重い障害が設定されている', () => {
  const context = disasterContext();
  context['親の人数'].あなた[0].selection = 1;
  context['災害によって、精神または身体に重い障害がありますか？'].親.push({
    type: 'Boolean',
    selection: true,
  });

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1.災害による重い後遺障害がある[currentDate]).toEqual(
    true
  );
});

test('親の災害による負傷が未回答の場合設定されない', () => {
  const context = disasterContext();
  context['親の人数'].あなた[0].selection = 1;

  const actual = toOpenFiscaHousehold({ context, currentDate });

  expect(actual.世帯員.親1).not.toHaveProperty('災害による負傷の療養期間');
});
