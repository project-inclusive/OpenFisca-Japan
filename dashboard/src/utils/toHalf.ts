/**
 * Converts full-width numbers in a string to half-width numbers.
 *
 * @param str - The string containing full-width numbers.
 * @returns The string with full-width numbers converted to half-width numbers.
 */
export function toHalf(str: string): string {
  return str.replace(/[０-９]/g, function (m: string): string {
    return '０１２３４５６７８９'.indexOf(m).toString();
  });
}
