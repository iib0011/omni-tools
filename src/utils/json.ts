/**
 * Collects all unique keys from an array of row objects, preserving first-encountered order.
 * Handles sparse rows where different rows may have different keys.
 *
 * @param input - Array of flattened row objects or string
 * @returns Array of unique header strings in insertion order
 *
 * @example
 * getJsonHeaders([{ a: '1' }, { a: '2', b: '3' }]) // → ['a', 'b']
 */
export function getJsonHeaders(
  input: Record<string, string>[] | string
): string[] {
  let rows: Record<string, string>[];

  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      rows = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [];
    }
  } else {
    rows = input;
  }

  return Array.from(
    rows.reduce<Set<string>>((set, row) => {
      Object.keys(row).forEach((key) => set.add(key));
      return set;
    }, new Set())
  );
}
