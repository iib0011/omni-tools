import { InitialValuesType } from './types';
import { transpose, normalizeAndFill } from '@utils/array';
import { splitCsv } from '@utils/csv';

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
    .map((row) => row.join(options.separator))
    .join('\n');
}
