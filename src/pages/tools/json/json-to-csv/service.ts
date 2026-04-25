import { InitialValuesType } from './types';
import { getJsonHeaders } from 'utils/json';

/**
 * Recursively flattens any JSON value into a flat object.
 * Objects → dot notation
 * Arrays  → index notation
 */
function flattenRecursive(
  value: unknown,
  prefix = '',
  result: Record<string, string> = {}
): Record<string, string> {
  if (value === null || value === undefined) {
    if (prefix) result[prefix] = '';
    return result;
  }

  if (typeof value !== 'object') {
    if (prefix) result[prefix] = String(value);
    return result;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const newKey = prefix ? `${prefix}[${index}]` : `[${index}]`;
      flattenRecursive(item, newKey, result);
    });
    return result;
  }

  for (const [key, val] of Object.entries(value)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    flattenRecursive(val, newKey, result);
  }

  return result;
}

/**
 * Converts any JSON structure into row objects.
 */
function flattenToRows(json: unknown): Record<string, string>[] {
  if (Array.isArray(json)) {
    return json.map((item) => flattenRecursive(item));
  }

  if (typeof json === 'object' && json !== null) {
    return [flattenRecursive(json)];
  }

  throw new Error(
    'JSON input must be an object or array of objects, not a bare primitive.'
  );
}

/**
 * Escapes and quotes CSV cells according to options
 */
function quoteCell(value: string, options: InitialValuesType): string {
  const { delimiter, quoteStrings } = options;

  const escaped = value.replace(/"/g, '""');

  const needsQuoting =
    value.includes(delimiter) ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r');

  if (quoteStrings === 'always') return `"${escaped}"`;

  return needsQuoting ? `"${escaped}"` : value;
}

/**
 * Converts JSON string to CSV
 */
export function convertJsonToCsv(
  input: string,
  options: InitialValuesType
): string {
  const { delimiter, includeHeaders } = options;

  if (!delimiter) throw new Error('No CSV delimiter.');

  let parsed: unknown;

  try {
    parsed = JSON.parse(input);
  } catch {
    throw new Error('Invalid JSON input.');
  }

  const rows = flattenToRows(parsed).filter(
    (row) => Object.keys(row).length > 0
  );

  if (rows.length === 0) {
    throw new Error('No data found in the provided JSON.');
  }

  const headers = getJsonHeaders(rows);

  const lines: string[] = [];

  if (includeHeaders) {
    lines.push(headers.map((h) => quoteCell(h, options)).join(delimiter));
  }

  for (const row of rows) {
    const line = headers
      .map((header) => quoteCell(row[header] ?? '', options))
      .join(delimiter);

    lines.push(line);
  }

  return lines.join('\r\n');
}
