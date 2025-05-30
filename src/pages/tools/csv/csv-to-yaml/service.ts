import { InitialValuesType } from './types';
import { getCsvHeaders, splitCsv } from '@utils/csv';
import { unquoteIfQuoted } from '@utils/string';

function toYaml(
  input: Record<string, string>[] | string[][],
  indentSpaces: number = 2
): string {
  if (indentSpaces == 0) {
    throw new Error('Indent spaces must be greater than zero');
  }
  const indent = ' '.repeat(indentSpaces);

  if (
    Array.isArray(input) &&
    input.length > 0 &&
    typeof input[0] === 'object' &&
    !Array.isArray(input[0])
  ) {
    return (input as Record<string, string>[])
      .map((obj) => {
        const lines = Object.entries(obj)
          .map(([key, value]) => `${indent}${key}: ${value}`)
          .join('\n');
        return `-\n${lines}`;
      })
      .join('\n');
  }

  // If input is string[][].
  if (Array.isArray(input) && Array.isArray(input[0])) {
    return (input as string[][])
      .map((row) => {
        const inner = row.map((cell) => `${indent}- ${cell}`).join('\n');
        return `-\n${inner}`;
      })
      .join('\n');
  }

  return 'invalid input';
}

export function main(input: string, options: InitialValuesType): string {
  if (!input) {
    return '';
  }

  const rows = splitCsv(
    input,
    true,
    options.commentCharacter,
    options.emptyLines,
    options.csvSeparator,
    options.quoteCharacter
  );

  rows.forEach((row) => {
    row.forEach((cell, cellIndex) => {
      row[cellIndex] = unquoteIfQuoted(cell, options.quoteCharacter);
    });
  });

  if (options.headerRow) {
    const headerRow = getCsvHeaders(
      input,
      options.csvSeparator,
      options.quoteCharacter,
      options.commentCharacter
    );
    headerRow.forEach((header, headerIndex) => {
      headerRow[headerIndex] = unquoteIfQuoted(header, options.quoteCharacter);
    });

    const result: Record<string, string>[] = rows.slice(1).map((row) => {
      const entry: Record<string, string> = {};
      headerRow.forEach((header, headerIndex) => {
        entry[header] = row[headerIndex] ?? '';
      });
      return entry;
    });
    return toYaml(result, options.spaces);
  }

  return toYaml(rows, options.spaces);
}
