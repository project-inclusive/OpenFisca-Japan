import pako from 'pako';
import { applySharePresets, stripSharePresets } from './sharePresets';

function bytesToBinaryString(bytes: Uint8Array): string {
  // 0x8000 = 32768。String.fromCharCode の引数一括展開によるスタックオーバーフロー回避用チャンクサイズ
  const chunkSize = 0x8000;
  let result = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    result += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return result;
}

function encodeBase64(bytes: Uint8Array): string {
  const binary = bytesToBinaryString(bytes);
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    return window.btoa(binary);
  }
  return Buffer.from(bytes).toString('base64');
}

function decodeBase64(base64: string): Uint8Array {
  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    return Uint8Array.from(window.atob(base64), (c) => c.charCodeAt(0));
  }
  return new Uint8Array(Buffer.from(base64, 'base64'));
}

/**
 * URL クエリ向けに base64 を URL-safe へ変換する（パディング省略）。
 */
export function toUrlSafeBase64(base64: string): string {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

/**
 * URL-safe base64 を標準 base64 へ戻す。
 */
export function fromUrlSafeBase64(urlSafe: string): string {
  const base64 = urlSafe.replace(/-/g, '+').replace(/_/g, '/');
  const padding = (4 - (base64.length % 4)) % 4;
  return base64 + '='.repeat(padding);
}

/**
 * Inflates a compressed string using the pako library.
 * @param compressedString The compressed string to be inflated.
 * @returns The inflated string.
 */
export function inflate(compressedString: string): string {
  const compressedBytes = decodeBase64(compressedString);
  const inflatedBytes = pako.inflate(compressedBytes, { raw: true });
  return new TextDecoder().decode(inflatedBytes);
}

function parseSharePayload(bytes: Uint8Array): any {
  // JSON は '[' または '{' で始まる。それ以外は deflate 済みとみなす。
  if (bytes[0] === 0x5b || bytes[0] === 0x7b) {
    return JSON.parse(new TextDecoder().decode(bytes));
  }
  const inflatedBytes = pako.inflate(bytes, { raw: true });
  return JSON.parse(new TextDecoder().decode(inflatedBytes));
}

/**
 * 共有用オブジェクトを短いキーへ符号化する。
 * 小さいデータは非圧縮、大きいデータは deflate を選び短い方を使う。
 */
export function encodeShareKey(obj: object): string {
  const compacted = stripSharePresets(obj as Record<string, any>);
  const json = JSON.stringify(compacted);
  const rawBytes = new TextEncoder().encode(json);
  const deflatedBytes = pako.deflate(rawBytes, {
    level: 9,
    raw: true,
  });
  const rawKey = toUrlSafeBase64(encodeBase64(rawBytes));
  const deflatedKey = toUrlSafeBase64(encodeBase64(deflatedBytes));
  return rawKey.length <= deflatedKey.length ? rawKey : deflatedKey;
}

/**
 * 共有キーを household（frontend 埋め込み可）へ復号する。
 * 旧形式（household JSON を直接 deflate したもの）も展開する。
 */
export function decodeShareData(key: string): Record<string, any> {
  const normalized = key.replaceAll(' ', '+');
  const bytes = decodeBase64(fromUrlSafeBase64(normalized));
  const payload = parseSharePayload(bytes);

  if (Array.isArray(payload)) {
    return applySharePresets(payload);
  }

  // 旧形式: 生の household JSON
  return payload;
}

/**
 * Generates a short link for sharing calculation results.
 *
 * @param obj - object.
 * @param isSimpleCalculation - Indicates whether it is a simple calculation.
 * @param isDisasterCalculation - Indicates whether it is a disaster calculation.
 * @returns The generated short link.
 */
export default function shortLink(
  obj: object,
  isSimpleCalculation: boolean,
  isDisasterCalculation: boolean
): string {
  const key = encodeShareKey(obj);
  return `${window.location.protocol}//${
    window.location.host
  }/result?share=${key}&1=${isSimpleCalculation ? 1 : 0}&2=${
    isDisasterCalculation ? 1 : 0
  }`;
}

/**
 * Generates a share link based on the current URL parameters.
 * @returns The share link.
 */
export function getShareLink(key?: string): string {
  const urlParams = new URLSearchParams(window.location.search);
  const shareKey = key ?? getShareKey();
  return `${window.location.protocol}//${
    window.location.host
  }/result?share=${shareKey}&1=${urlParams.get('1')}&2=${urlParams.get('2')}`;
}

/**
 * Retrieves the share key from the URL query parameters.
 * @returns The share key.
 */
export function getShareKey(): string {
  const urlParams = new URLSearchParams(window.location.search);
  // 旧形式の base64 は + がスペースになることがある
  return String(urlParams.get('share')).replaceAll(' ', '+');
}

/**
 * Retrieves the calculation type based on the URL parameters.
 * @returns An object containing the calculation type information.
 */
export function calculationType(): {
  isSimpleCalculation: boolean;
  isDisasterCalculation: boolean;
} {
  const urlParams = new URLSearchParams(window.location.search);
  const isSimpleCalculation = urlParams.get('1') === '1';
  const isDisasterCalculation = urlParams.get('2') === '1';
  return { isSimpleCalculation, isDisasterCalculation };
}
