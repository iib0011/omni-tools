/**
 * Normalizes an arbitrary string into a valid XML tag name.
 *
 * - Purely numeric keys are prefixed with "row-" (XML tag names can't
 *   start with a digit).
 * - Any character outside [a-zA-Z0-9_.-] is replaced with an underscore.
 * - If the result still doesn't start with a letter or underscore
 *   (e.g. it started with '.' or '-'), an underscore is prepended.
 *
 * @param {string} key - The raw key/field name to convert into a tag name.
 * @returns {string} A valid XML tag name.
 *
 * @example
 * normalizeXmlTagName('0');          // 'row-0'
 * normalizeXmlTagName('user name');  // 'user_name'
 * normalizeXmlTagName('-id');        // '_-id'
 */
export const normalizeXmlTagName = (key: string): string => {
  const tagName = key !== '' && !isNaN(Number(key)) ? `row-${key}` : key;

  const sanitized = tagName.replace(/[^a-zA-Z0-9_.-]/g, '_');

  return /^[a-zA-Z_]/.test(sanitized) ? sanitized : `_${sanitized}`;
};
