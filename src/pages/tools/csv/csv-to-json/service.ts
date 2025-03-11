type CsvToJsonOptions = {
  delimiter: string;
  quote: string;
  comment: string;
  useHeaders: boolean;
  skipEmptyLines: boolean;
  dynamicTypes: boolean;
};

const defaultOptions: CsvToJsonOptions = {
  delimiter: ',',
  quote: '"',
  comment: '#',
  useHeaders: true,
  skipEmptyLines: true,
  dynamicTypes: true
};

export const convertCsvToJson = (
  csv: string,
  options: Partial<CsvToJsonOptions> = {}
): string => {
  const opts = { ...defaultOptions, ...options };
  const lines = csv.split('\n');
  const result: any[] = [];
  let headers: string[] = [];

  // Filter out comments and empty lines
  const validLines = lines.filter((line) => {
    const trimmedLine = line.trim();
    return (
      trimmedLine &&
      (!opts.skipEmptyLines ||
        !containsOnlyCustomCharAndSpaces(trimmedLine, opts.delimiter)) &&
      !trimmedLine.startsWith(opts.comment)
    );
  });

  if (validLines.length === 0) {
    return '[]';
  }

  // Parse headers if enabled
  if (opts.useHeaders) {
    headers = parseCsvLine(validLines[0], opts);
    validLines.shift();
  }

  // Parse data lines
  for (const line of validLines) {
    const values = parseCsvLine(line, opts);

    if (opts.useHeaders) {
      const obj: Record<string, any> = {};
      headers.forEach((header, i) => {
        obj[header] = parseValue(values[i], opts.dynamicTypes);
      });
      result.push(obj);
    } else {
      result.push(values.map((v) => parseValue(v, opts.dynamicTypes)));
    }
  }

  return JSON.stringify(result, null, 2);
};

const parseCsvLine = (line: string, options: CsvToJsonOptions): string[] => {
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
