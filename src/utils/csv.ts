/**
 * Splits a CSV line into string[], handling quoted string.
 * @param {string} input - The CSV input string.
 * @param {string} delimiter - The character used to split csvlines.
 * @param {string} quoteChar - The character used to quotes csv values.
 * @returns {string[][]} - The CSV line as a 1D array.
 */
function splitCsvLine(
  line: string,
  delimiter: string = ',',
  quoteChar: string = '"'
): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === quoteChar) {
      if (inQuotes && nextChar === quoteChar) {
        current += quoteChar;
        i++; // Skip the escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

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
  deleteEmptyLines: boolean,
  delimiter: string = ',',
  quoteChar: string = '"'
): string[][] {
  let rows = input
    .split('\n')
    .map((row) => splitCsvLine(row, delimiter, quoteChar));

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
 * @param {string} csvSeparator - The character used to separate values in the CSV.
 * @param {string} quoteChar - The character used to quotes csv values.
 * @param {string} commentCharacter - The character used to denote comments.
 * @returns {string[]} - The CSV header as a 1D array.
 */
export function getCsvHeaders(
  csvString: string,
  csvSeparator: string = ',',
  quoteChar: string = '"',
  commentCharacter?: string
): string[] {
  const lines = csvString.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    if (
      trimmed === '' ||
      (commentCharacter && trimmed.startsWith(commentCharacter))
    ) {
      continue; // skip empty or commented lines
    }

    const headerLine = splitCsvLine(trimmed, csvSeparator, quoteChar);
    return headerLine.map((h) => h.replace(/^\uFEFF/, '').trim());
  }

  return [];
}
