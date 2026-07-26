import { InitialValuesType } from './types';
import { escapeMarkup } from '@utils/string';
import { normalizeXmlTagName } from '@utils/xml';

export const convertCsvToXml = (
  csv: string,
  options: InitialValuesType
): string => {
  const lines = csv.split('\n').map((line) => line.trim());

  let xmlResult = `<?xml version="1.0" encoding="UTF-8" ?>\n<root>\n`;
  let headers: string[] = [];

  const validLines = lines.filter(
    (line) =>
      line &&
      !line.startsWith(options.comment) &&
      (!options.skipEmptyLines || line.trim() !== '')
  );

  if (validLines.length === 0) {
    return `<?xml version="1.0" encoding="UTF-8" ?>\n<root></root>`;
  }

  if (options.useHeaders) {
    headers = parseCsvLine(validLines[0], options).map(normalizeXmlTagName);
    validLines.shift();
  } else {
    // No header row to source tag names from - fall back to positional
    // column names (col1, col2, ...) based on the first data row's width,
    // so rows still get real field tags instead of coming out empty.
    const columnCount = parseCsvLine(validLines[0], options).length;
    headers = Array.from({ length: columnCount }, (_, i) => `col${i + 1}`);
  }

  validLines.forEach((line, index) => {
    const values = parseCsvLine(line, options);
    xmlResult += `  <row id="${index}">\n`;
    headers.forEach((header, i) => {
      xmlResult += `    <${header}>${escapeMarkup(
        values[i] || ''
      )}</${header}>\n`;
    });
    xmlResult += `  </row>\n`;
  });

  xmlResult += `</root>`;
  return xmlResult;
};

const parseCsvLine = (line: string, options: InitialValuesType): string[] => {
  const values: string[] = [];
  let currentValue = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === options.quote) {
        // A doubled quote ("") inside a quoted field is an escaped
        // literal quote, not the end of the field.
        if (line[i + 1] === options.quote) {
          currentValue += options.quote;
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        currentValue += char;
      }
    } else if (char === options.quote && currentValue === '') {
      // Only treat a quote as opening a quoted field when it's the very
      // first character of the field - a quote appearing mid-field
      // (e.g. `say "hello"`) is just literal text, not a CSV delimiter.
      inQuotes = true;
    } else if (char === options.delimiter) {
      values.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }

  values.push(currentValue.trim());
  return values;
};
