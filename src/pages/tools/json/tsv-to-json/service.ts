import { InitialValuesType } from './types';
import { beautifyJson } from '../prettify/service';
import { minifyJson } from '../minify/service';

export function convertTsvToJson(
  input: string,
  options: InitialValuesType
): string {
  if (!input) return '';
  const lines = input.split('\n');
  const result: any[] = [];
  let headers: string[] = [];

  // Filter out comments and empty lines
  const validLines = lines.filter((line) => {
    const trimmedLine = line.trim();
    return (
      trimmedLine &&
      (!options.skipEmptyLines ||
        !containsOnlyCustomCharAndSpaces(trimmedLine, options.delimiter)) &&
      !trimmedLine.startsWith(options.comment)
    );
  });

  if (validLines.length === 0) {
    return '[]';
  }

  // Parse headers if enabled
  if (options.useHeaders) {
    headers = parseCsvLine(validLines[0], options);
    validLines.shift();
  }

  // Parse data lines
  for (const line of validLines) {
    const values = parseCsvLine(line, options);

    if (options.useHeaders) {
      const obj: Record<string, any> = {};
      headers.forEach((header, i) => {
        obj[header] = parseValue(values[i], options.dynamicTypes);
      });
      result.push(obj);
    } else {
      result.push(values.map((v) => parseValue(v, options.dynamicTypes)));
    }
  }

  return options.indentationType === 'none'
    ? minifyJson(JSON.stringify(result))
    : beautifyJson(
        JSON.stringify(result),
        options.indentationType,
        options.spacesCount
      );
}

const parseCsvLine = (line: string, options: InitialValuesType): string[] => {
  const values: string[] = [];
  let currentValue = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === options.quote) {
      inQuotes = !inQuotes;
    } else if (char === options.delimiter && !inQuotes) {
      values.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }

  values.push(currentValue.trim());
  return values;
};

const parseValue = (value: string, dynamicTypes: boolean): any => {
  if (!dynamicTypes) return value;

  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;
  if (value === 'null') return null;
  if (!isNaN(Number(value))) return Number(value);

  return value;
};

function containsOnlyCustomCharAndSpaces(str: string, customChar: string) {
  const regex = new RegExp(`^[${customChar}\\s]*$`);
  return regex.test(str);
}
