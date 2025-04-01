/**
 * Splits a CSV string into rows, skipping any blank lines.
 * @param {string} input - The CSV input string.
 * @param {string} commentCharacter - The character used to denote comments.
 * @returns {string[][]} - The CSV rows as a 2D array.
 */
export function splitCsv(
  input: string,
  deleteComment: boolean,
  commentCharacter: string,
  deleteEmptyLines: boolean
): string[][] {
  let rows = input.split('\n').map((row) => row.split(','));

  // Remove comments if deleteComment is true
  if (deleteComment && commentCharacter) {
    rows = rows.filter((row) => !row[0].trim().startsWith(commentCharacter));
  }

  // Remove empty lines if deleteEmptyLines is true
  if (deleteEmptyLines) {
    rows = rows.filter((row) => row.some((cell) => cell.trim() !== ''));
  }

  return rows;
}

/**
 * get the headers from  a CSV string .
 * @param {string} input - The CSV input string.
 * @returns {string[]} - The CSV header as a 1D array.
 */
export function getCsvHeaders(csvString: string): string[] {
  const rows = csvString.split('\n').map((row) => row.split(','));
  return rows.length > 0 ? rows[0].map((header) => header.trim()) : [];
}
