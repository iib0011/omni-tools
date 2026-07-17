type CsvToXmlOptions = {
  delimiter: string;
  quote: string;
  comment: string;
  useHeaders: boolean;
  skipEmptyLines: boolean;
};

/**
 * Escape special XML characters in text content.
 */
const escapeXml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

/**
 * Sanitize a string so it can be used as a valid XML element name.
 * Replaces characters that are not allowed in XML names with underscores.
 */
const sanitizeXmlElementName = (name: string): string => {
  // XML element names must start with a letter or underscore,
  // and may only contain letters, digits, hyphens, underscores, and periods.
  return name
    .replace(/^[^a-zA-Z_]+/, '')
    .replace(/[^a-zA-Z0-9_\-.]/g, '_');
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
    headers = parseCsvLine(validLines[0], options).map(sanitizeXmlElementName);
    validLines.shift();
  }

  validLines.forEach((line, index) => {
    const values = parseCsvLine(line, options);
    xmlResult += `  <row id="${index}">\n`;
    headers.forEach((header, i) => {
      xmlResult += `    <${header}>${escapeXml(values[i] || '')}</${header}>\n`;
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
