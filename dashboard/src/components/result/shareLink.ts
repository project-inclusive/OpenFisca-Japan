import pako from 'pako';

// JSON文字列を圧縮する関数
export function deflate(jsonString: string): string {
  const utf8Bytes = new TextEncoder().encode(jsonString);
  const compressedBytes = pako.deflate(utf8Bytes, {
    level: 9,
    raw: true,
  });
  return window.btoa(String.fromCharCode(...compressedBytes));
}

// 圧縮された文字列を解凍してJSON文字列に戻す関数
export function inflate(compressedString: string): string {
  const compressedBytes = Uint8Array.from(window.atob(compressedString), (c) =>
    c.charCodeAt(0)
  );
  const inflatedBytes = pako.inflate(compressedBytes, { raw: true });
  return new TextDecoder().decode(inflatedBytes);
}

export default function shortLink(
  obj: object,
  isSimpleCalculation: boolean,
  isDisasterCalculation: boolean
) {
  return `${window.location.protocol}//${
    window.location.host
  }/result?share=${deflate(JSON.stringify(obj))}&1=${
    isSimpleCalculation ? 1 : 0
  }&2=${isDisasterCalculation ? 1 : 0}`;
}

export function calculationType() {
  const urlParams = new URLSearchParams(window.location.search);
  const isSimpleCalculation = urlParams.get('1') === '1';
  const isDisasterCalculation = urlParams.get('2') === '1';
  return { isSimpleCalculation, isDisasterCalculation };
}