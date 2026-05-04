import { order, InitialValuesType } from './types';

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

export const sortJson = (text: string, options: InitialValuesType): string => {
  const { mode, order, key } = options;
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    throw new Error('Invalid JSON string');
  }

  if (mode === 'key') {
    if (Array.isArray(parsed)) {
      if (parsed.length === 0) throw new Error('Array is empty');
      return JSON.stringify(
        parsed.map((item) => sortObject(item, order)),
        null,
        2
      );
    }
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Input must be a JSON object or array of objects');
    }
    return JSON.stringify(sortObject(parsed, order), null, 2);
  }

  // value mode
  if (!Array.isArray(parsed)) throw new Error('Input must be a JSON array');
  if (parsed.length === 0) throw new Error('Array is empty');

  const sorted = [...parsed].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
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

  return JSON.stringify(sorted, null, 2);
};
