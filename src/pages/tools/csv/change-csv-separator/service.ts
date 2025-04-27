import { InitialValuesType } from './types';
import { splitCsv } from '@utils/csv';

export function changeCsvSeparator(
  input: string,
  options: InitialValuesType
): string {
  if (!input) return '';

  const rows = splitCsv(
    input,
    true,
    options.commentCharacter,
    options.emptyLines,
    options.inputSeparator,
    options.inputQuoteCharacter
  );

  return rows
    .map((row) => {
      return row
        .map((cell) => {
          if (options.outputQuoteAll) {
            return `${options.OutputQuoteCharacter}${cell}${options.OutputQuoteCharacter}`;
          }
          return cell;
        })
        .join(options.outputSeparator);
    })
    .join('\n');
}
