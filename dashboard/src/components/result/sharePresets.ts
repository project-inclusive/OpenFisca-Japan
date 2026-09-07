import pmJson from '../../config/都道府県市区町村.json';

/**
 * 共有 URL を短くするためのプリセット定義と pack/unpack。
 *
 * アプリ側に固定スキーマを持ち、URL には差分だけを載せる。
 * 位置配列・地域インデックス・万円単位を使い、小さいデータは非圧縮を優先する。
 */

/**
 * 世帯一覧に付与する結果取得用 Variable のプリセット。
 * 値は常に null のため URL から省略し、展開時に復元する。
 */
export const HOUSEHOLD_RESULT_VARIABLE_PRESET: readonly string[] = [
  '児童手当',
  '児童扶養手当_最大',
  '児童扶養手当_最小',
  '特別児童扶養手当_最小',
  '特別児童扶養手当_最大',
  '生活保護',
  '障害児福祉手当',
  '高等学校奨学給付金_最小',
  '高等学校奨学給付金_最大',
  '生活支援費',
  '一時生活再建費',
  '福祉費',
  '緊急小口資金',
  '教育支援費',
  '就学支度費',
  '不動産担保型生活資金',
  '受験生チャレンジ支援貸付',
  '災害弔慰金',
  '災害障害見舞金_最大',
  '災害障害見舞金_最小',
  '被災者生活再建支援制度',
  '災害援護資金',
  '高等学校等就学支援金_最大',
  '高等学校等就学支援金_最小',
  '健康管理費用_最大',
  '健康管理費用_最小',
  '健康管理支援事業_最大',
  '健康管理支援事業_最小',
  '先天性の傷病治療によるC型肝炎患者に係るQOL向上等のための調査研究事業_最大',
  '先天性の傷病治療によるC型肝炎患者に係るQOL向上等のための調査研究事業_最小',
  '障害基礎年金_最大',
  '障害基礎年金_最小',
  '特別障害者手当_最大',
  '特別障害者手当_最小',
  '特定疾病療養の対象者がいる',
  '先天性血液凝固因子障害等治療研究事業の対象者がいる',
  '重度心身障害者医療費助成制度の対象者がいる',
  '傷病手当金_最大',
  '傷病手当金_最小',
  // 東京都独自の支援制度
  '児童育成手当',
  '障害児童育成手当',
  '重度心身障害者手当_最小',
  '重度心身障害者手当_最大',
] as const;

/** frontendHousehold.困りごとのデフォルト（すべて false） */
export const FRONTEND_KOMARIGOTO_PRESET: Readonly<Record<string, boolean>> = {
  仕事について: false,
  妊娠について: false,
  出産や子育てについて: false,
  進学について: false,
  介護について: false,
  入院について: false,
  病気や障害について: false,
  離婚について: false,
};

/** frontendHousehold.制度のデフォルト（すべて false） */
export const FRONTEND_SEIDO_PRESET: Readonly<Record<string, boolean>> = {
  '雇用保険（失業手当）': false,
  '求職者支援制度（職業訓練・ハロートレーニング）': false,
  '住宅支援（住居確保給付金）': false,
  '健康保険・年金の減免制度（国民健康保険に加入している場合）': false,
  '健康保険・年金の減免制度（国民年金に加入している場合）': false,
  '健康保険・年金の減免制度（共済組合、協会けんぽまたは健康保険組合に加入している場合）':
    false,
  自立相談支援機関による相談支援: false,
  妊婦健診の助成: false,
  '富士見市出産・子育て応援給付金': false,
  '産前産後休業（産休）': false,
  低所得世帯向けの入院助産制度: false,
  '健康保険・年金の減免制度': false,
  '出産育児一時金（国民健康保険に加入している場合）': false,
  '出産育児一時金（共済組合、協会けんぽまたは健康保険組合に加入している場合）':
    false,
  '出産手当金（会社員・公務員向け）': false,
  育児休業給付金: false,
  '高額療養費制度（国民健康保険に加入している場合）': false,
  '高額療養費制度（共済組合、協会けんぽまたは健康保険組合に加入している場合）':
    false,
  富士見市産後ケア事業: false,
  富士見市こども医療費助成: false,
  ひとり親家庭等医療費助成: false,
  未熟児養育医療費助成: false,
  小児慢性特定疾患医療費助成: false,
  '医療費控除（確定申告）': false,
  養育費に関する公正証書等の作成費用補助: false,
  子どものための養育費相談: false,
  '身体障害者手帳・療育手帳・精神障害者保健福祉手帳': false,
  自立支援医療: false,
  重度障害者医療費助成: false,
  指定難病医療給付制度: false,
  障がい者向けの就労支援: false,
  介護保険制度: false,
  介護休業制度: false,
  介護保険料の減免: false,
  老人介護手当: false,
  介護保険サービス利用者負担助成金: false,
  給付型奨学金: false,
  埼玉県母子寡婦福祉資金貸付金: false,
  埼玉県私立学校の父母負担軽減: false,
};

/**
 * 日本語キー → 短い識別子の固定辞書（アプリ側プリセット）。
 * URL には短い識別子だけを載せ、展開時に復元する。
 */
export const SHARE_KEY_CODE_PRESET: Readonly<Record<string, string>> = {
  世帯員: 'm',
  世帯一覧: 'H',
  世帯1: 'h',
  frontend: 'f',
  世帯: 'hh',
  困りごと: 'k',
  制度: 'z',
  ETERNITY: 'E',
  あなた: 'a',
  配偶者: 's',
  親一覧: 'pl',
  子一覧: 'cl',
  祖父母一覧: 'gl',
  居住都道府県: 'pref',
  居住市区町村: 'city',
  配偶者がいるがひとり親に該当: 'sp',
  誕生年月日: 'bd',
  収入: 'inc',
  預貯金: 'dep',
  就労形態: 'job',
  六か月以内に新規就労: 'nj',
  休業中に給与の支払いがない: 'lw',
  業務によって病気になった: 'iw',
  業務によってけがをした: 'ii',
  病気によって連続三日以上休業している: 'sl',
  けがによって連続三日以上休業している: 'il',
  HIV感染者である: 'hiv',
  血液凝固因子異常症_第I因子欠乏症: 'h1',
  血液凝固因子異常症_第II因子欠乏症: 'h2',
  血液凝固因子異常症_第V因子欠乏症: 'h5',
  血液凝固因子異常症_第VII因子欠乏症: 'h7',
  血液凝固因子異常症_第VIII因子欠乏症: 'h8',
  血液凝固因子異常症_第IX因子欠乏症: 'h9',
  血液凝固因子異常症_第X因子欠乏症: 'h10',
  血液凝固因子異常症_第XI因子欠乏症: 'h11',
  血液凝固因子異常症_第XII因子欠乏症: 'h12',
  血液凝固因子異常症_第XIII因子欠乏症: 'h13',
  血液凝固因子異常症_フォンヴィルブランド病: 'hv',
  血液凝固因子異常症_その他: 'ho',
  住宅入居費: 'rent',
  被災している: 'dis',
  災害救助法の適用地域である: 'dra',
  被災者生活再建支援法の適用地域である: 'drb',
  住宅被害: 'hd',
  住宅再建方法: 'hr',
  家財の損害: 'gd',
  災害で死亡した世帯員の人数: 'dd',
  災害で生計維持者が死亡した: 'db',
};

const KEY_TO_CODE = SHARE_KEY_CODE_PRESET;
const CODE_TO_KEY: Record<string, string> = Object.fromEntries(
  Object.entries(SHARE_KEY_CODE_PRESET).map(([key, code]) => [code, key])
);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const CHILD_RE = /^子ども(\d+)$/;
const PARENT_RE = /^親(\d+)$/;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function currentDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
}

function encodePersonName(name: string): string {
  if (KEY_TO_CODE[name]) {
    return KEY_TO_CODE[name];
  }
  const child = name.match(CHILD_RE);
  if (child) {
    return `c${child[1]}`;
  }
  const parent = name.match(PARENT_RE);
  if (parent) {
    return `p${parent[1]}`;
  }
  return name;
}

function decodePersonName(code: string): string {
  if (CODE_TO_KEY[code]) {
    return CODE_TO_KEY[code];
  }
  const child = code.match(/^c(\d+)$/);
  if (child) {
    return `子ども${child[1]}`;
  }
  const parent = code.match(/^p(\d+)$/);
  if (parent) {
    return `親${parent[1]}`;
  }
  return code;
}

function encodeKey(key: string): string {
  return KEY_TO_CODE[key] ?? encodePersonName(key);
}

function decodeKey(code: string): string {
  return CODE_TO_KEY[code] ?? decodePersonName(code);
}

function isOmittablePeriodValue(value: unknown): boolean {
  return value === false || value === null || value === '';
}

function isOmittablePeriodField(value: unknown): boolean {
  if (!isPlainObject(value)) {
    return false;
  }
  const entries = Object.entries(value);
  if (entries.length === 0) {
    return true;
  }
  return entries.every(([, v]) => isOmittablePeriodValue(v));
}

/**
 * 世帯データから期間キー（YYYY-MM-DD）を推定する。
 */
export function resolvePeriodDate(household: Record<string, any>): string {
  const household1 = household?.世帯一覧?.世帯1;
  if (isPlainObject(household1)) {
    for (const value of Object.values(household1)) {
      if (!isPlainObject(value) || Array.isArray(value)) {
        continue;
      }
      for (const key of Object.keys(value)) {
        if (DATE_RE.test(key)) {
          return key;
        }
      }
    }
  }

  const members = household?.世帯員;
  if (isPlainObject(members)) {
    for (const member of Object.values(members)) {
      if (!isPlainObject(member)) {
        continue;
      }
      for (const value of Object.values(member)) {
        if (!isPlainObject(value) || Array.isArray(value)) {
          continue;
        }
        for (const key of Object.keys(value)) {
          if (DATE_RE.test(key)) {
            return key;
          }
        }
      }
    }
  }

  return currentDateString();
}

function compactBooleanMap(
  source: Record<string, boolean> | undefined,
  preset: Readonly<Record<string, boolean>>
): Record<string, boolean> {
  const result: Record<string, boolean> = {};
  if (!source) {
    return result;
  }
  for (const [key, value] of Object.entries(source)) {
    if (value !== (preset[key] ?? false)) {
      result[key] = value;
    }
  }
  return result;
}

function collapsePeriodValue(value: unknown, periodDate: string): unknown {
  if (!isPlainObject(value) || Array.isArray(value)) {
    return value;
  }
  const keys = Object.keys(value);
  if (keys.length === 1 && keys[0] === periodDate) {
    return value[periodDate];
  }
  if (keys.length === 1 && keys[0] === 'ETERNITY') {
    return { E: value.ETERNITY };
  }
  return value;
}

function expandPeriodValue(value: unknown, periodDate: string): unknown {
  if (isPlainObject(value) && 'E' in value && Object.keys(value).length === 1) {
    return { ETERNITY: value.E };
  }
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return { [periodDate]: value };
  }
  return value;
}

function remapKeysDeep(
  value: unknown,
  mapKey: (key: string) => string,
  mapStringValue?: (value: string) => string
): unknown {
  if (Array.isArray(value)) {
    return value.map((item) =>
      typeof item === 'string' && mapStringValue
        ? mapStringValue(item)
        : remapKeysDeep(item, mapKey, mapStringValue)
    );
  }
  if (!isPlainObject(value)) {
    return value;
  }
  const result: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    result[mapKey(key)] = remapKeysDeep(child, mapKey, mapStringValue);
  }
  return result;
}

function stripMemberDefaults(member: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(member)) {
    if (isOmittablePeriodField(value)) {
      continue;
    }
    result[key] = value;
  }
  return result;
}

const PREFECTURE_NAMES = Object.keys(pmJson);
const MONEY_YEN_FIELDS = new Set(['収入', '預貯金']);
const FRONTEND_KOMARIGOTO_KEYS = Object.keys(FRONTEND_KOMARIGOTO_PRESET);
const FRONTEND_SEIDO_KEYS = Object.keys(FRONTEND_SEIDO_PRESET);

function encodeLocation(
  pref: string,
  city: string
): [number | string, number | string] {
  const prefIndex = PREFECTURE_NAMES.indexOf(pref);
  if (prefIndex < 0) {
    return [pref, city];
  }
  const cities = (pmJson as Record<string, string[]>)[pref] ?? [];
  const cityIndex = cities.indexOf(city);
  if (cityIndex < 0) {
    return [prefIndex, city];
  }
  return [prefIndex, cityIndex];
}

function decodeLocation(
  pref: number | string,
  city: number | string
): [string, string] {
  const prefName =
    typeof pref === 'number' ? PREFECTURE_NAMES[pref] ?? String(pref) : pref;
  if (typeof city === 'number') {
    const cities = (pmJson as Record<string, string[]>)[prefName] ?? [];
    return [prefName, cities[city] ?? String(city)];
  }
  return [prefName, city];
}

function toYyMmDdNumber(periodDate: string): number {
  const [y, m, d] = periodDate.split('-').map(Number);
  return (y % 100) * 10000 + m * 100 + d;
}

function fromYyMmDdNumber(value: number): string {
  const yy = Math.floor(value / 10000);
  const m = Math.floor((value % 10000) / 100);
  const d = value % 100;
  const year = yy >= 70 ? 1900 + yy : 2000 + yy;
  return `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function compactMemberValue(field: string, value: unknown): unknown {
  if (field === '誕生年月日' && isPlainObject(value)) {
    const eternity = value.E ?? value.ETERNITY;
    if (typeof eternity === 'string') {
      const match = eternity.match(/^(\d{4})-01-01$/);
      if (match) {
        return Number(match[1]);
      }
      return eternity;
    }
  }
  if (MONEY_YEN_FIELDS.has(field) && typeof value === 'number') {
    return Math.round(value / 10000);
  }
  if (value === true) {
    return 1;
  }
  return value;
}

function expandMemberValue(
  field: string,
  value: unknown,
  periodDate: string
): unknown {
  if (field === '誕生年月日') {
    if (typeof value === 'number') {
      return { ETERNITY: `${value}-01-01` };
    }
    if (typeof value === 'string') {
      return { ETERNITY: value };
    }
    if (isPlainObject(value) && ('E' in value || 'ETERNITY' in value)) {
      return expandPeriodValue(value, periodDate);
    }
  }
  let expanded = value;
  if (MONEY_YEN_FIELDS.has(field) && typeof value === 'number') {
    expanded = value * 10000;
  } else if (expanded === 1) {
    expanded = true;
  }
  return expandPeriodValue(expanded, periodDate);
}

function trueFlagIndices(
  source: Record<string, boolean> | undefined,
  keys: string[]
): number[] {
  if (!source) {
    return [];
  }
  const indices: number[] = [];
  keys.forEach((key, index) => {
    if (source[key]) {
      indices.push(index);
    }
  });
  return indices;
}

function expandFlagIndices(
  indices: number[] | undefined,
  keys: string[],
  preset: Readonly<Record<string, boolean>>
): Record<string, boolean> {
  const result = { ...preset };
  for (const index of indices ?? []) {
    const key = keys[index];
    if (key) {
      result[key] = true;
    }
  }
  return result;
}

function encodeSubtree(value: unknown): unknown {
  return remapKeysDeep(value, encodeKey, (item) => encodePersonName(item));
}

function decodeSubtree(value: unknown): unknown {
  return remapKeysDeep(value, decodeKey, (item) => decodePersonName(item));
}

function isDefaultParentList(value: unknown): boolean {
  return (
    Array.isArray(value) &&
    value.length === 1 &&
    (value[0] === 'あなた' || value[0] === 'a')
  );
}

/**
 * 共有ペイロードをコンパクト形式（位置配列）へ変換する。
 * [yymmdd, pref, city, members, household?, frontend?]
 */
export function stripSharePresets(payload: Record<string, any>): any[] {
  const source = structuredClone(payload);
  const periodDate = resolvePeriodDate(source);

  const membersIn: Record<string, any> = isPlainObject(source.世帯員)
    ? source.世帯員
    : {};
  const membersOut: Record<string, any> = {};
  for (const [name, member] of Object.entries(membersIn)) {
    if (!isPlainObject(member)) {
      continue;
    }
    const stripped = stripMemberDefaults(member);
    const collapsed: Record<string, any> = {};
    for (const [field, value] of Object.entries(stripped)) {
      const flat = collapsePeriodValue(value, periodDate);
      collapsed[field] = compactMemberValue(field, flat);
    }
    if (Object.keys(collapsed).length > 0) {
      membersOut[name] = collapsed;
    } else {
      // 一覧にだけ存在する世帯員でもスロットを残す
      membersOut[name] = {};
    }
  }

  const household1In: Record<string, any> = isPlainObject(
    source.世帯一覧?.世帯1
  )
    ? source.世帯一覧.世帯1
    : {};

  let pref: number | string = '';
  let city: number | string = '';
  const prefField = collapsePeriodValue(household1In.居住都道府県, periodDate);
  const cityField = collapsePeriodValue(household1In.居住市区町村, periodDate);
  if (typeof prefField === 'string' && typeof cityField === 'string') {
    [pref, city] = encodeLocation(prefField, cityField);
  } else {
    pref = typeof prefField === 'string' ? prefField : '';
    city = typeof cityField === 'string' ? cityField : '';
  }

  const householdExtras: Record<string, any> = {};
  for (const [key, value] of Object.entries(household1In)) {
    if (key === '居住都道府県' || key === '居住市区町村') {
      continue;
    }
    if (key === '親一覧' && isDefaultParentList(value)) {
      continue;
    }
    if (Array.isArray(value)) {
      // 空の 子一覧 / 祖父母一覧 などはデフォルトとして省略
      if (value.length === 0) {
        continue;
      }
      householdExtras[key] = value;
      continue;
    }
    if (isOmittablePeriodField(value)) {
      continue;
    }
    householdExtras[key] = collapsePeriodValue(value, periodDate);
  }

  let frontendOut: any = null;
  if (isPlainObject(source.frontend)) {
    const 困りごと = compactBooleanMap(
      source.frontend.困りごと as Record<string, boolean> | undefined,
      FRONTEND_KOMARIGOTO_PRESET
    );
    const 制度 = compactBooleanMap(
      source.frontend.制度 as Record<string, boolean> | undefined,
      FRONTEND_SEIDO_PRESET
    );
    const k = trueFlagIndices(困りごと, FRONTEND_KOMARIGOTO_KEYS);
    const z = trueFlagIndices(制度, FRONTEND_SEIDO_KEYS);
    const 世帯 = isPlainObject(source.frontend.世帯)
      ? source.frontend.世帯
      : {};
    const 世帯員 = isPlainObject(source.frontend.世帯員)
      ? source.frontend.世帯員
      : {};
    const hasMemberData = Object.values(世帯員).some(
      (member) => isPlainObject(member) && Object.keys(member).length > 0
    );
    const hasHouseholdData = Object.keys(世帯).length > 0;
    if (hasMemberData || hasHouseholdData || k.length > 0 || z.length > 0) {
      frontendOut = {};
      if (hasMemberData) {
        frontendOut.m = encodeSubtree(世帯員);
      }
      if (hasHouseholdData) {
        frontendOut.hh = 世帯;
      }
      if (k.length > 0) {
        frontendOut.k = k;
      }
      if (z.length > 0) {
        frontendOut.z = z;
      }
    }
  }

  const wire: any[] = [
    toYyMmDdNumber(periodDate),
    pref,
    city,
    encodeSubtree(membersOut),
  ];
  if (Object.keys(householdExtras).length > 0) {
    wire.push(encodeSubtree(householdExtras));
  } else if (frontendOut) {
    wire.push(null);
  }
  if (frontendOut) {
    wire.push(frontendOut);
  }
  return wire;
}

/**
 * コンパクト形式を計算用 household へ復元する。
 */
export function applySharePresets(wire: any[]): Record<string, any> {
  const periodDate =
    typeof wire[0] === 'number'
      ? fromYyMmDdNumber(wire[0])
      : typeof wire[0] === 'string' && DATE_RE.test(wire[0])
      ? wire[0]
      : currentDateString();
  const [prefName, cityName] = decodeLocation(
    wire[1] as number | string,
    wire[2] as number | string
  );

  const membersIn: Record<string, any> = isPlainObject(wire[3])
    ? (decodeSubtree(wire[3]) as Record<string, any>)
    : {};
  const membersOut: Record<string, any> = {};
  for (const [name, member] of Object.entries(membersIn)) {
    if (!isPlainObject(member)) {
      membersOut[name] = {};
      continue;
    }
    const expanded: Record<string, any> = {};
    for (const [field, value] of Object.entries(member)) {
      expanded[field] = expandMemberValue(field, value, periodDate);
    }
    membersOut[name] = expanded;
  }
  if (!('あなた' in membersOut)) {
    membersOut.あなた = {};
  }

  const householdExtras: Record<string, any> = isPlainObject(wire[4])
    ? (decodeSubtree(wire[4]) as Record<string, any>)
    : {};
  const household1Out: Record<string, any> = {
    親一覧: Array.isArray(householdExtras.親一覧)
      ? householdExtras.親一覧
      : ['あなた'],
    子一覧: Array.isArray(householdExtras.子一覧) ? householdExtras.子一覧 : [],
    祖父母一覧: Array.isArray(householdExtras.祖父母一覧)
      ? householdExtras.祖父母一覧
      : [],
    居住都道府県: { [periodDate]: prefName },
    居住市区町村: { [periodDate]: cityName },
  };
  for (const [key, value] of Object.entries(householdExtras)) {
    if (key === '親一覧' || key === '子一覧' || key === '祖父母一覧') {
      continue;
    }
    household1Out[key] = expandPeriodValue(value, periodDate);
  }
  for (const key of HOUSEHOLD_RESULT_VARIABLE_PRESET) {
    if (!(key in household1Out)) {
      household1Out[key] = { [periodDate]: null };
    }
  }

  const restored: Record<string, any> = {
    世帯員: membersOut,
    世帯一覧: { 世帯1: household1Out },
  };

  // wire:
  // [d, pref, city, members]
  // [d, pref, city, members, household]
  // [d, pref, city, members, null, frontend]
  // [d, pref, city, members, household, frontend]
  const frontend = wire.length >= 6 ? wire[5] : undefined;

  if (isPlainObject(frontend)) {
    restored.frontend = {
      世帯員: frontend.m ? decodeSubtree(frontend.m) : { あなた: {} },
      世帯: frontend.hh ?? {},
      困りごと: Array.isArray(frontend.k)
        ? expandFlagIndices(
            frontend.k,
            FRONTEND_KOMARIGOTO_KEYS,
            FRONTEND_KOMARIGOTO_PRESET
          )
        : { ...FRONTEND_KOMARIGOTO_PRESET },
      制度: Array.isArray(frontend.z)
        ? expandFlagIndices(
            frontend.z,
            FRONTEND_SEIDO_KEYS,
            FRONTEND_SEIDO_PRESET
          )
        : { ...FRONTEND_SEIDO_PRESET },
    };
  }

  return restored;
}
