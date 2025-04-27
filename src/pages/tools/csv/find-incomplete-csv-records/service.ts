import { InitialValuesType } from './types';
import { splitCsv } from '@utils/csv';

function generateMessage(
  row: string[],
  lineIndex: number,
  maxLength: number,
  emptyLines: boolean,
  emptyValues: boolean
) {
  const lineNumber = lineIndex + 1;
  // check if empty lines are allowed
  if (!emptyLines && row.length === 1 && row[0] === '')
    return { title: 'Missing Line', message: `Line ${lineNumber} is empty.` };

  // if row legth is less than maxLength it means that there are missing columns
  if (row.length < maxLength)
    return {
      title: `Found missing column(s) on line ${lineNumber}`,
      message: `Line ${lineNumber} has ${
        maxLength - row.length
      } missing column(s).`
    };

  // if row length is equal to maxLength we should check if there are empty values
  if (row.length == maxLength && emptyValues) {
    let missingValues = false;
    let message = `Empty values on line ${lineNumber}: `;
    row.forEach((cell, index) => {
      if (cell.trim() === '') {
        missingValues = true;
        message += `column ${index + 1}, `;
      }
    });
    if (missingValues)
      return {
        title: `Found missing values on line ${lineNumber}`,
        message: message.slice(0, -2) + '.'
      };
  }

  return null;
}
export function findIncompleteCsvRecords(
  input: string,
  options: InitialValuesType
): string {
  if (!input) return '';

  if (options.messageLimit && options.messageNumber <= 0)
    throw new Error('Message number must be greater than 0');

  const rows = splitCsv(
    input,
    true,
    options.commentCharacter,
    options.emptyLines,
    options.csvSeparator,
    options.quoteCharacter
  );
  const maxLength = Math.max(...rows.map((row) => row.length));
  const messages = rows
    .map((row, index) =>
      generateMessage(
        row,
        index,
        maxLength,
        options.emptyLines,
        options.emptyValues
      )
    )
    .filter(Boolean)
    .map((msg) => `Title: ${msg!.title}\nMessage: ${msg!.message}`);

  return messages.length > 0
    ? options.messageLimit
      ? messages.slice(0, options.messageNumber).join('\n\n')
      : messages.join('\n\n')
    : 'The Csv input is complete.';
}
