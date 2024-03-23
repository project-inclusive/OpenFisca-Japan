import pako from 'pako';

// JSON文字列を圧縮する関数
export function deflate(jsonString: string): string {
  const utf8Bytes = new TextEncoder().encode(jsonString);
  const compressedBytes = pako.deflate(utf8Bytes, { level: 9 });
  return window.btoa(String.fromCharCode(...compressedBytes));
}

// 圧縮された文字列を解凍してJSON文字列に戻す関数
export function inflate(compressedString: string): string {
  const compressedBytes = Uint8Array.from(window.atob(compressedString), (c) =>
    c.charCodeAt(0)
  );
  const inflatedBytes = pako.inflate(compressedBytes);
  return new TextDecoder().decode(inflatedBytes);
}

export default function shortLink(
  obj: object,
  isSimpleCalculation: boolean,
  isDisasterCalculation: boolean
) {
  return `${window.location.protocol}//${
    window.location.host
  }/result?share=${deflate(
    JSON.stringify(obj)
  )}&isSimpleCalculation=${isSimpleCalculation}&isDisasterCalculation=${isDisasterCalculation}`;
}
