type CsvToXmlOptions = {
  delimiter: string;
  quote: string;
  comment: string;
  useHeaders: boolean;
  skipEmptyLines: boolean;
};

const defaultOptions: CsvToXmlOptions = {
  delimiter: ',',
  quote: '"',
  comment: '#',
  useHeaders: true,
  skipEmptyLines: true
};

export const convertCsvToXml = (
  csv: string,
  options: Partial<CsvToXmlOptions> = {}
): string => {
  const opts = { ...defaultOptions, ...options };
  const lines = csv.split('\n').map((line) => line.trim());

  let xmlResult = `<?xml version="1.0" encoding="UTF-8" ?>\n<root>\n`;
  let headers: string[] = [];

  const validLines = lines.filter(
    (line) =>
      line &&
      !line.startsWith(opts.comment) &&
      (!opts.skipEmptyLines || line.trim() !== '')
  );

  if (validLines.length === 0) {
    return `<?xml version="1.0" encoding="UTF-8" ?>\n<root></root>`;
  }

  if (opts.useHeaders) {
    headers = parseCsvLine(validLines[0], opts);
    validLines.shift();
  }

  validLines.forEach((line, index) => {
    const values = parseCsvLine(line, opts);
    xmlResult += `  <row id="${index}">\n`;
    headers.forEach((header, i) => {
      xmlResult += `    <${header}>${values[i] || ''}</${header}>\n`;
    });
    xmlResult += `  </row>\n`;
  });

  xmlResult += `</root>`;
  return xmlResult;
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
