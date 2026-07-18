type CsvToXmlOptions = {
  delimiter: string;
  quote: string;
  comment: string;
  useHeaders: boolean;
  skipEmptyLines: boolean;
};

export const convertCsvToXml = (
  csv: string,
  options: CsvToXmlOptions
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
    headers = parseCsvLine(validLines[0], options);
    validLines.shift();
  }

  validLines.forEach((line, index) => {
    const values = parseCsvLine(line, options);
    xmlResult += `  <row id="${index}">\n`;
    headers.forEach((header, i) => {
      const tagName = normalizeXmlTagName(header);
      xmlResult += `    <${tagName}>${escapeXml(
        values[i] || ''
      )}</${tagName}>\n`;
    });
    xmlResult += `  </row>\n`;
  });

  xmlResult += `</root>`;
  return xmlResult;
};

const escapeXml = (value: string): string => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

const normalizeXmlTagName = (header: string): string => {
  const tagName =
    header !== '' && !isNaN(Number(header)) ? `column-${header}` : header;

  const sanitized = tagName.replace(/[^a-zA-Z0-9_.-]/g, '_');

  return /^[a-zA-Z_]/.test(sanitized) ? sanitized : `_${sanitized}`;
};

const parseCsvLine = (line: string, options: CsvToXmlOptions): string[] => {
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
