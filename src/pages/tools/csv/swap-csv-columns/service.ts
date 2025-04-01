import { splitCsv } from '@utils/csv';
import { InitialValuesType } from './types';

function retrieveFromAndTo(
  headerRow: string[],
  options: InitialValuesType
): number[] {
  const from = options.fromPositionStatus
    ? Number(options.fromPosition)
    : headerRow.findIndex((header) => header === options.fromHeader) + 1;

  const to = options.toPositionStatus
    ? Number(options.toPosition)
    : headerRow.findIndex((header) => header === options.toHeader) + 1;

  if (from <= 0 || to <= 0)
    throw new Error('Invalid column positions. Check headers or positions.');

  if (from > headerRow.length || to > headerRow.length)
    throw new Error(`There are only ${headerRow.length} columns`);

  return [from, to];
}

function swap(lines: string[][], from: number, to: number): string[][] {
  if (from <= 0 || to <= 0)
    throw new Error('Columns position must be greater than zero ');

  return lines.map((row) => {
    const newRow = [...row]; // Clone the row to avoid mutating the original
    [newRow[from - 1], newRow[to - 1]] = [newRow[to - 1], newRow[from - 1]]; // Swap values
    return newRow;
  });
}

export function csvColumnsSwap(input: string, options: InitialValuesType) {
  if (!input) {
    return '';
  }
  // split csv input and remove comments
  const rows = splitCsv(
    input,
    options.deleteComment,
    options.commentCharacter,
    options.emptyLines
  );

  const columnCount = Math.max(...rows.map((row) => row.length));
  for (let i = 0; i < rows.length; i++) {
    for (let j = 0; j < columnCount; j++) {
      if (!rows[i][j]) {
        rows[i][j] = options.emptyValuesFilling ? '' : options.customFiller;
      }
    }
  }

  const positions = retrieveFromAndTo(rows[0], options);

  const result = swap(rows, positions[0], positions[1]);
  return result.join('\n');
}
