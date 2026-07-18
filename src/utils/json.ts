/**
 * Parses a JSON string, falling back to NDJSON (newline-delimited JSON, a.k.a.
 * JSON Lines) when the input is not a single valid JSON value.
 *
 * This lets users paste multiple JSON objects without wrapping them in an
 * array, e.g.:
 *
 *   {"key1": "AAA"}
 *   {"key1": "BBB"}
 *
 * Standard JSON (an object or array) is parsed first and returned unchanged.
 * Otherwise each non-empty line must be a valid JSON value, and the values are
 * returned as an array. A single line that is not valid JSON is reported as a
 * plain JSON error rather than being misread as NDJSON.
 *
 * @param input - Raw text to parse
 * @returns The parsed JSON value, or an array of values when NDJSON is detected
 * @throws SyntaxError when the input is neither valid JSON nor valid NDJSON
 *
 * @example
 * parseJsonOrNdjson('{"a":1}\n{"a":2}') // → [{ a: 1 }, { a: 2 }]
 */
export function parseJsonOrNdjson(input: string): unknown {
  const trimmed = input.trim();

  try {
    return JSON.parse(trimmed);
  } catch (jsonError) {
    const lines = trimmed
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    // A single line that already failed JSON.parse is not NDJSON — surface the
    // original error instead of masking it.
    if (lines.length < 2) {
      throw jsonError;
    }

    const values: unknown[] = [];
    for (const line of lines) {
      try {
        values.push(JSON.parse(line));
      } catch {
        // Not valid NDJSON either — report the original JSON parse failure.
        throw jsonError;
      }
    }

    return values;
  }
}

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
