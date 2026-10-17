import { order, InitialValuesType, SortJsonResult } from './types';
import { parseJsonInput, JsonFormat } from '@utils/json';

const sortObject = (
  obj: Record<string, unknown>,
  order: order
): Record<string, unknown> => {
  const sortedKeys = Object.keys(obj).sort((a, b) => {
    const cmp = a.localeCompare(b);
    return order === 'asc' ? cmp : -cmp;
  });
  const result: Record<string, unknown> = {};
  for (const key of sortedKeys) result[key] = obj[key];
  return result;
};

/**
 * Serializes the final value back to a string, matching the shape of the
 * original input: NDJSON (one compact JSON value per line) for 'jsonl'
 * input, pretty-printed JSON otherwise.
 */
const serialize = (value: unknown, format: JsonFormat): string => {
  if (format === 'jsonl' && Array.isArray(value)) {
    return value.map((item) => JSON.stringify(item)).join('\n');
  }
  return JSON.stringify(value, null, 2);
};

export const sortJson = (
  text: string,
  options: InitialValuesType
): SortJsonResult => {
  const { mode, order, key } = options;

  const { data, format } = parseJsonInput(text);

  if (mode === 'key') {
    if (Array.isArray(data)) {
      if (data.length === 0) throw new Error('Array is empty');
      const sortedArray = data.map((item) =>
        sortObject(item as Record<string, unknown>, order)
      );
      return { result: serialize(sortedArray, format), format };
    }
    if (typeof data !== 'object' || data === null) {
      throw new Error('Input must be a JSON object or array of objects');
    }
    return { result: serialize(sortObject(data, order), format), format };
  }

  // value mode
  if (!Array.isArray(data)) throw new Error('Input must be a JSON array');
  if (data.length === 0) throw new Error('Array is empty');

  const sorted = [...data].sort((a, b) => {
    const aRow = a as Record<string, unknown>;
    const bRow = b as Record<string, unknown>;
    const aVal = aRow[key];
    const bVal = bRow[key];
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (typeof aVal === 'object' && typeof bVal === 'object') {
      const aStr = JSON.stringify(aVal);
      const bStr = JSON.stringify(bVal);
      if (aStr < bStr) return order === 'asc' ? -1 : 1;
      if (aStr > bStr) return order === 'asc' ? 1 : -1;
      return 0;
    }
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });

  return { result: serialize(sorted, format), format };
};
