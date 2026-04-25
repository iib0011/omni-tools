/**
 * Collects all unique keys from an array of row objects, preserving first-encountered order.
 * Handles sparse rows where different rows may have different keys.
 *
 * @param rows - Array of flattened row objects
 * @returns Array of unique header strings in insertion order
 *
 * @example
 * getJsonHeaders([{ a: '1' }, { a: '2', b: '3' }]) // → ['a', 'b']
 */
export function getJsonHeaders(rows: Record<string, string>[]): string[] {
  return Array.from(
    rows.reduce<Set<string>>((set, row) => {
      Object.keys(row).forEach((key) => set.add(key));
      return set;
    }, new Set())
  );
}
