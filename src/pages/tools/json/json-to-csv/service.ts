type CsvOptions = {
  delimiter: ',' | ';' | '\t';
  includeHeaders: boolean;
  quoteStrings: 'always' | 'auto' | 'never';
};

/**
 * Flattens a JSON value into an array of row objects.
 * Supports:
 *   - Array of objects  → multiple rows
 *   - Single object     → one row
 *   - Primitive         → one row with a single "value" column
 */
function flattenToRows(json: unknown): Record<string, string>[] {
  if (Array.isArray(json)) {
    return json.map((item, index) => {
      if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
        return flattenObject(item as Record<string, unknown>);
      }
      // Primitive inside array → index as key
      return { [`item_${index}`]: String(item) };
    });
  }

  if (json !== null && typeof json === 'object') {
    return [flattenObject(json as Record<string, unknown>)];
  }

  // Top-level primitive
  return [{ value: String(json) }];
}

/**
 * Dot-notation flattening for nested objects.
 * Arrays inside objects are serialised as JSON strings to keep CSV flat.
 */
function flattenObject(
  obj: Record<string, unknown>,
  prefix = ''
): Record<string, string> {
  return Object.entries(obj).reduce<Record<string, string>>(
    (acc, [key, val]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        Object.assign(
          acc,
          flattenObject(val as Record<string, unknown>, fullKey)
        );
      } else {
        acc[fullKey] = val === null || val === undefined ? '' : String(val);
      }

      return acc;
    },
    {}
  );
}

function quoteCell(
  value: string,
  quoteStrings: CsvOptions['quoteStrings'],
  delimiter: string
): string {
  const needsQuoting =
    value.includes(delimiter) ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r');

  const escaped = value.replace(/"/g, '""');

  if (quoteStrings === 'always') return `"${escaped}"`;
  if (quoteStrings === 'never') return value;
  // 'auto' — only quote when necessary
  return needsQuoting ? `"${escaped}"` : value;
}

export function convertJsonToCsv(input: string, options: CsvOptions): string {
  const { delimiter, includeHeaders, quoteStrings } = options;

  const parsed: unknown = JSON.parse(input); // throws on invalid JSON
  const rows = flattenToRows(parsed);

  if (rows.length === 0) {
    throw new Error('No data found in the provided JSON.');
  }

  // Collect all unique keys preserving insertion order
  const headers = Array.from(
    rows.reduce<Set<string>>((set, row) => {
      Object.keys(row).forEach((k) => set.add(k));
      return set;
    }, new Set())
  );

  const lines: string[] = [];

  if (includeHeaders) {
    lines.push(
      headers.map((h) => quoteCell(h, quoteStrings, delimiter)).join(delimiter)
    );
  }

  for (const row of rows) {
    lines.push(
      headers
        .map((h) => quoteCell(row[h] ?? '', quoteStrings, delimiter))
        .join(delimiter)
    );
  }

  return lines.join('\n');
}
