export function formatNumber(
  num: number | string,
  fallback: number = 0
): number {
  if (!num) return fallback;
  const result: number = Number(num);
  if (!result) {
    return fallback;
  }
  return result >= 0 ? result : fallback;
}
