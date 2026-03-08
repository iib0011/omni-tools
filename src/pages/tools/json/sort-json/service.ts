export const sortJson = (
  text: string,
  sortKey: string,
  order: 'asc' | 'desc'
): string => {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    throw new Error('Invalid JSON string');
  }
  if (!Array.isArray(parsed)) {
    throw new Error('Input must be a JSON array');
  }
  const sorted = [...parsed].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
  return JSON.stringify(sorted, null, 2);
};
