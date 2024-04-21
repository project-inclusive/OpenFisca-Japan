import pako from 'pako';

/**
 * Deflates a JSON string using the pako library and encodes it in base64.
 * @param jsonString - The JSON string to deflate and encode.
 * @returns The deflated and base64-encoded string.
 */
export function deflate(jsonString: string): string {
  const utf8Bytes = new TextEncoder().encode(jsonString);
  const compressedBytes = pako.deflate(utf8Bytes, {
    level: 9,
    raw: true,
  });
  return window.btoa(String.fromCharCode(...compressedBytes));
}

/**
 * Inflates a compressed string using the pako library.
 * @param compressedString The compressed string to be inflated.
 * @returns The inflated string.
 */
export function inflate(compressedString: string): string {
  const compressedBytes = Uint8Array.from(window.atob(compressedString), (c) =>
    c.charCodeAt(0)
  );
  const inflatedBytes = pako.inflate(compressedBytes, { raw: true });
  return new TextDecoder().decode(inflatedBytes);
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
  const key = deflate(JSON.stringify(obj));
  //console.log('[DEBUG] shortLink -> key: ', key);
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
  const key = String(urlParams.get('share')).replaceAll(' ', '+');
  //console.log('[DEBUG] getShareKey -> key: ', key);
  return key;
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
