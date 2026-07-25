export type ParsedJson =
  | Record<string, unknown>
  | unknown[]
  | string
  | number
  | boolean
  | null;

/**
 * Parses a JSON string into its JavaScript representation.
 *
 * Supports:
 * - Standard JSON (objects, arrays, and primitives)
 * - JSON Lines (NDJSON), where each non-empty line is a valid JSON value
 *
 * @param input - The JSON string to parse.
 * @returns The parsed JSON value, or an array of parsed values for JSON Lines input.
 * Returns an empty string if the input is empty or whitespace-only.
 * @throws {Error} If the input contains invalid JSON.
 */
export function parseJsonInput(input: string): ParsedJson {
  try {
    return JSON.parse(input);
  } catch (originalError) {
    const lines = input.split(/\r?\n/);

    // preserve blank lines numbers
    const nonBlankLines: { text: string; lineNumber: number }[] = [];
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed) {
        nonBlankLines.push({ text: trimmed, lineNumber: index + 1 });
      }
    });

    // A single line that fails isn't NDJSON, it's just malformed JSON -
    // surface the original error instead of a misleading one.
    if (nonBlankLines.length <= 1) {
      const reason =
        originalError instanceof Error
          ? originalError.message
          : 'Unknown error';
      throw new Error(`Invalid JSON: ${reason}`);
    }

    const parsedLines: unknown[] = [];

    for (const { text, lineNumber } of nonBlankLines) {
      try {
        parsedLines.push(JSON.parse(text));
      } catch (error) {
        const reason =
          error instanceof Error
            ? error.message.replace(/\s*\(line \d+ column \d+\)$/, '')
            : 'Unknown error';

        throw new Error(`Invalid JSON at line ${lineNumber}: ${reason}`);
      }
    }

    return parsedLines;
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
      const parsed = parseJsonInput(input);
      rows = (Array.isArray(parsed) ? parsed : [parsed]) as Record<
        string,
        string
      >[];
    } catch {
      return [];
    }
  } else {
    rows = input;
  }

  return Array.from(
    rows.reduce<Set<string>>((set, row) => {
      // Skip anything that isn't a plain object (null, arrays, strings, etc.)
      // to avoid crashing or pulling in bogus "headers" from those values.
      if (row && typeof row === 'object' && !Array.isArray(row)) {
        Object.keys(row).forEach((key) => set.add(key));
      }
      return set;
    }, new Set())
  );
}
