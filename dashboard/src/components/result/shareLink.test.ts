import { expect, test } from 'vitest';
import pako from 'pako';
import {
  FRONTEND_KOMARIGOTO_PRESET,
  FRONTEND_SEIDO_PRESET,
  HOUSEHOLD_RESULT_VARIABLE_PRESET,
  applySharePresets,
  resolvePeriodDate,
  stripSharePresets,
} from './sharePresets';
import {
  decodeShareData,
  encodeShareKey,
  fromUrlSafeBase64,
  inflate,
  toUrlSafeBase64,
} from './shareLink';

const sampleHousehold = {
  世帯員: {
    あなた: {
      誕生年月日: { ETERNITY: '1990-01-01' },
      収入: { '2024-06-01': 3000000 },
      預貯金: { '2024-06-01': 500000 },
      業務によって病気になった: { '2024-06-01': false },
      HIV感染者である: { '2024-06-01': false },
      血液凝固因子異常症_第I因子欠乏症: { '2024-06-01': false },
    },
  },
  世帯一覧: {
    世帯1: {
      親一覧: ['あなた'],
      子一覧: [] as string[],
      祖父母一覧: [] as string[],
      居住都道府県: { '2024-06-01': '東京都' },
      居住市区町村: { '2024-06-01': '渋谷区' },
      児童手当: { '2024-06-01': null },
      児童扶養手当_最大: { '2024-06-01': null },
      生活保護: { '2024-06-01': null },
      傷病手当金_最大: { '2024-06-01': null },
      傷病手当金_最小: { '2024-06-01': null },
      配偶者がいるがひとり親に該当: {},
    },
  },
  frontend: {
    世帯員: { あなた: {} },
    世帯: {},
    困りごと: {
      ...FRONTEND_KOMARIGOTO_PRESET,
      仕事について: true,
    },
    制度: {
      ...FRONTEND_SEIDO_PRESET,
      '雇用保険（失業手当）': true,
    },
  },
};

function encodeLegacyShareKey(payload: object): string {
  const utf8Bytes = new TextEncoder().encode(JSON.stringify(payload));
  const compressedBytes = pako.deflate(utf8Bytes, { level: 9, raw: true });
  return Buffer.from(compressedBytes).toString('base64');
}

test('stripSharePresets は位置配列になり冗長値を落とす', () => {
  const stripped = stripSharePresets(sampleHousehold);

  expect(stripped[0]).toBe(240601);
  expect(typeof stripped[1]).toBe('number');
  expect(typeof stripped[2]).toBe('number');
  expect(stripped[3].a.inc).toBe(300);
  expect(stripped[3].a.dep).toBe(50);
  expect(stripped[3].a.bd).toBe(1990);
  expect(stripped[3].a.iw).toBeUndefined();
  expect(stripped[5].k).toEqual([0]);
  expect(stripped[5].z).toEqual([0]);
});

test('applySharePresets は結果 Variable と frontend デフォルトを復元する', () => {
  const stripped = stripSharePresets(sampleHousehold);
  const restored = applySharePresets(stripped);

  for (const key of HOUSEHOLD_RESULT_VARIABLE_PRESET) {
    expect(restored.世帯一覧.世帯1[key]).toEqual({ '2024-06-01': null });
  }
  expect(restored.世帯員.あなた.収入).toEqual({ '2024-06-01': 3000000 });
  expect(restored.世帯員.あなた.誕生年月日).toEqual({
    ETERNITY: '1990-01-01',
  });
  expect(restored.世帯一覧.世帯1.居住都道府県).toEqual({
    '2024-06-01': '東京都',
  });
  expect(restored.世帯一覧.世帯1.居住市区町村).toEqual({
    '2024-06-01': '渋谷区',
  });
  expect(restored.frontend.困りごと.仕事について).toBe(true);
  expect(restored.frontend.制度['雇用保険（失業手当）']).toBe(true);
});

test('resolvePeriodDate は世帯データ内の日付キーを返す', () => {
  expect(resolvePeriodDate(sampleHousehold)).toBe('2024-06-01');
});

test('encode/decode のラウンドトリップで入力情報が保持される', () => {
  const key = encodeShareKey(sampleHousehold);
  expect(
    key.includes('p1.') || key.includes('p2.') || key.includes('p3.')
  ).toBe(false);

  const decoded = decodeShareData(key);
  expect(decoded.世帯員.あなた.収入).toEqual({ '2024-06-01': 3000000 });
  expect(decoded.世帯一覧.世帯1.居住都道府県).toEqual({
    '2024-06-01': '東京都',
  });
  expect(decoded.frontend.困りごと.仕事について).toBe(true);
});

test('実データ相当は数十文字まで短縮される', () => {
  const realistic = {
    世帯員: {
      あなた: {
        収入: { '2026-09-06': 1000000 },
        業務によって病気になった: { '2026-09-06': false },
        HIV感染者である: { '2026-09-06': false },
        血液凝固因子異常症_第I因子欠乏症: { '2026-09-06': false },
      },
    },
    世帯一覧: {
      世帯1: {
        親一覧: ['あなた'],
        子一覧: [],
        祖父母一覧: [],
        居住都道府県: { '2026-09-06': '愛知県' },
        居住市区町村: { '2026-09-06': '名古屋市' },
        配偶者がいるがひとり親に該当: {},
        児童手当: { '2026-09-06': null },
      },
    },
    frontend: {
      世帯員: {},
      世帯: {},
      困りごと: {},
      制度: {},
    },
  };

  const key = encodeShareKey(realistic);
  expect(key.length).toBeLessThan(60);
  const decoded = decodeShareData(key);
  expect(decoded.世帯員.あなた.収入).toEqual({ '2026-09-06': 1000000 });
  expect(decoded.世帯一覧.世帯1.居住都道府県).toEqual({
    '2026-09-06': '愛知県',
  });
});

test('旧形式の共有キーも decodeShareData で展開できる', () => {
  const legacyKey = encodeLegacyShareKey(sampleHousehold);
  const decoded = decodeShareData(legacyKey);
  expect(decoded.世帯員.あなた.収入).toEqual({ '2024-06-01': 3000000 });
  expect(decoded.frontend.困りごと.仕事について).toBe(true);
});

test('旧形式: クエリで + がスペースになった共有キーも復元できる', () => {
  let legacyKey = '';
  for (let i = 0; i < 20; i++) {
    const candidate = encodeLegacyShareKey({
      ...sampleHousehold,
      nonce: i,
    });
    if (candidate.includes('+')) {
      legacyKey = candidate;
      break;
    }
  }
  expect(legacyKey.includes('+')).toBe(true);
  const restoredKey = legacyKey.replaceAll('+', ' ').replaceAll(' ', '+');
  expect(decodeShareData(restoredKey).世帯員.あなた.収入).toEqual({
    '2024-06-01': 3000000,
  });
});

test('URL-safe base64 の変換は可逆', () => {
  const original = 'SGVsbG8/V29ybGQr';
  expect(fromUrlSafeBase64(toUrlSafeBase64(original))).toBe(original);
});

test('inflate は deflate 相当のデータを展開できる', () => {
  const text = JSON.stringify({ hello: '世界' });
  const compressed = pako.deflate(new TextEncoder().encode(text), {
    level: 9,
    raw: true,
  });
  const base64 = Buffer.from(compressed).toString('base64');
  expect(inflate(base64)).toBe(text);
});
