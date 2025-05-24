import { InitialValuesType } from './types';
import { splitCsv } from '@utils/csv';
import { transpose, normalizeAndFill } from '@utils/array';

export function main(input: string, options: InitialValuesType): string {
  if (!input || !options.csvToInsert) return '';

  // Parse input CSV and insert CSV
  const inputRows = splitCsv(
    input,
    true,
    options.commentCharacter,
    true,
    options.separator,
    options.quoteChar
  );

  const filledRows = options.customFill
    ? normalizeAndFill(inputRows, options.customFillValue)
    : normalizeAndFill(inputRows, '');

  let columns = transpose(filledRows);

  const csvToInsertRows = splitCsv(
    options.csvToInsert,
    true,
    options.commentCharacter,
    true,
    options.separator,
    options.quoteChar
  );

  const filledCsvToInsertRows = options.customFill
    ? normalizeAndFill(csvToInsertRows, options.customFillValue)
    : normalizeAndFill(csvToInsertRows, '');

  const columnsToInsert = transpose(filledCsvToInsertRows);

  switch (options.insertingPosition) {
    case 'prepend':
      columns = [...columnsToInsert, ...columns];
      break;

    case 'append':
      columns = [...columns, ...columnsToInsert];
      break;

    case 'custom':
      if (options.customPostionOptions === 'headerName') {
        const headerName = options.headerName;
        const index = filledRows[0].indexOf(headerName);
        if (index !== -1) {
          columns = [
            ...columns.slice(0, index + 1),
            ...columnsToInsert,
            ...columns.slice(index + 1)
          ];
        } // else: keep original columns
      } else if (options.customPostionOptions === 'rowNumber') {
        const index = options.rowNumber;
        if (index >= 0 && index <= columns.length) {
          columns = [
            ...columns.slice(0, index),
            ...columnsToInsert,
            ...columns.slice(index)
          ];
        } // else: keep original columns
      }
      break;

    default:
      // no-op, keep original columns
      break;
  }

  // Transpose back to rows
  const normalizedColumns = normalizeAndFill(columns, options.customFillValue);
  const finalRows = transpose(normalizedColumns);

  return finalRows.map((row) => row.join(options.separator)).join('\n');
}
