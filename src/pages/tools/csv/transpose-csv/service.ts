import { InitialValuesType } from './types';
import { transpose, normalizeAndFill } from '@utils/array';
import { splitCsv } from '@utils/csv';

function quoteCell(cell: string, { separator, quoteChar }: InitialValuesType) {
  if (
    !quoteChar ||
    ![separator, quoteChar, '\n', '\r'].some((character) =>
      cell.includes(character)
    )
  ) {
    return cell;
  }

  const escaped = cell.split(quoteChar).join(quoteChar + quoteChar);
  return `${quoteChar}${escaped}${quoteChar}`;
}

export function transposeCSV(
  input: string,
  options: InitialValuesType
): string {
  if (!input) return '';

  const rows = splitCsv(
    input,
    true,
    options.commentCharacter,
    true,
    options.separator,
    options.quoteChar
  );

  const normalizeAndFillRows = options.customFill
    ? normalizeAndFill(rows, options.customFillValue)
    : normalizeAndFill(rows, '');

  return transpose(normalizeAndFillRows)
    .map((row) =>
      row.map((cell) => quoteCell(cell, options)).join(options.separator)
    )
    .join('\n');
}
