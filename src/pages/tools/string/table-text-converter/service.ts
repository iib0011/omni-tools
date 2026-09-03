import { splitCsv } from '@utils/csv';
import { TableFormat } from './types';

type TableRows = string[][];

function isSeparatorRow(cells: string[]): boolean {
  return cells.every((cell) => /^:?-+:?$/.test(cell.trim()));
}

function parseDelimited(input: string, delimiter: string): TableRows {
  return splitCsv(input, false, '', true, delimiter).filter(
    (row) => row.length > 0
  );
}

function parsePipeDelimited(input: string): TableRows {
  const rows: TableRows = [];
  for (const line of input.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || /^[+|][-+|]*[+|]$/.test(trimmed)) {
      // skip empty lines and mysql/ascii border lines like +---+---+
      continue;
    }
    const cells = trimmed
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((cell) => cell.trim());
    if (isSeparatorRow(cells)) {
      // skip markdown header separator row, e.g. |---|---|
      continue;
    }
    rows.push(cells);
  }
  return rows;
}

function parseHtml(input: string): TableRows {
  const doc = new DOMParser().parseFromString(input, 'text/html');
  const table = doc.querySelector('table');
  if (!table) {
    throw new Error('No <table> element found in the input');
  }
  const rows: TableRows = [];
  table.querySelectorAll('tr').forEach((tr) => {
    const cells = Array.from(tr.querySelectorAll('th,td')).map((cell) =>
      (cell.textContent ?? '').trim()
    );
    if (cells.length > 0) {
      rows.push(cells);
    }
  });
  return rows;
}

function parseJson(input: string): TableRows {
  const data = JSON.parse(input);
  if (!Array.isArray(data)) {
    throw new Error('JSON input must be an array of objects');
  }
  const headers: string[] = [];
  data.forEach((item) => {
    if (item && typeof item === 'object') {
      Object.keys(item).forEach((key) => {
        if (!headers.includes(key)) {
          headers.push(key);
        }
      });
    }
  });
  const body = data.map((item) =>
    headers.map((header) => {
      const value = item?.[header];
      return value === undefined || value === null ? '' : String(value);
    })
  );
  return [headers, ...body];
}

export function detectTableFormat(input: string): TableFormat {
  const trimmed = input.trim();
  if (/<table[\s>]/i.test(trimmed)) {
    return 'html';
  }
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    return 'json';
  }
  const firstLine = trimmed.split('\n')[0]?.trim() ?? '';
  if (/^\+[-+]+\+$/.test(firstLine)) {
    return 'mysql';
  }
  if (firstLine.includes('|')) {
    return 'markdown';
  }
  if (firstLine.includes('\t')) {
    return 'tsv';
  }
  return 'csv';
}

export function parseTable(input: string, format: TableFormat): TableRows {
  switch (format) {
    case 'markdown':
    case 'mysql':
      return parsePipeDelimited(input);
    case 'csv':
      return parseDelimited(input, ',');
    case 'tsv':
      return parseDelimited(input, '\t');
    case 'html':
      return parseHtml(input);
    case 'json':
      return parseJson(input);
  }
}

function escapeCsvField(field: string, delimiter: string): string {
  if (
    field.includes(delimiter) ||
    field.includes('"') ||
    field.includes('\n')
  ) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function toDelimited(rows: TableRows, delimiter: string): string {
  return rows
    .map((row) =>
      row.map((cell) => escapeCsvField(cell, delimiter)).join(delimiter)
    )
    .join('\n');
}

function toMarkdown(rows: TableRows): string {
  if (rows.length === 0) return '';
  const [header, ...body] = rows;
  const headerLine = `| ${header.join(' | ')} |`;
  const separatorLine = `| ${header.map(() => '---').join(' | ')} |`;
  const bodyLines = body.map((row) => `| ${row.join(' | ')} |`);
  return [headerLine, separatorLine, ...bodyLines].join('\n');
}

function toMysql(rows: TableRows): string {
  if (rows.length === 0) return '';
  const columnCount = rows[0].length;
  const widths = Array.from({ length: columnCount }, (_, colIndex) =>
    Math.max(...rows.map((row) => (row[colIndex] ?? '').length))
  );
  const border = `+${widths.map((width) => '-'.repeat(width + 2)).join('+')}+`;
  const formatRow = (row: string[]) =>
    `| ${row
      .map((cell, colIndex) => (cell ?? '').padEnd(widths[colIndex]))
      .join(' | ')} |`;

  const [header, ...body] = rows;
  return [
    border,
    formatRow(header),
    border,
    ...body.map(formatRow),
    border
  ].join('\n');
}

function toHtml(rows: TableRows): string {
  if (rows.length === 0) return '';
  const [header, ...body] = rows;
  const headerRow = `    <tr>\n${header
    .map((cell) => `      <th>${cell}</th>`)
    .join('\n')}\n    </tr>`;
  const bodyRows = body
    .map(
      (row) =>
        `    <tr>\n${row
          .map((cell) => `      <td>${cell}</td>`)
          .join('\n')}\n    </tr>`
    )
    .join('\n');
  return `<table>\n  <thead>\n${headerRow}\n  </thead>\n  <tbody>\n${bodyRows}\n  </tbody>\n</table>`;
}

function toJson(rows: TableRows): string {
  if (rows.length === 0) return '[]';
  const [header, ...body] = rows;
  const data = body.map((row) =>
    Object.fromEntries(
      header.map((key, colIndex) => [key, row[colIndex] ?? ''])
    )
  );
  return JSON.stringify(data, null, 2);
}

export function formatTable(rows: TableRows, format: TableFormat): string {
  switch (format) {
    case 'markdown':
      return toMarkdown(rows);
    case 'csv':
      return toDelimited(rows, ',');
    case 'tsv':
      return toDelimited(rows, '\t');
    case 'html':
      return toHtml(rows);
    case 'mysql':
      return toMysql(rows);
    case 'json':
      return toJson(rows);
  }
}

export function convertTable(
  input: string,
  inputFormat: TableFormat | 'auto',
  outputFormat: TableFormat
): string {
  if (!input.trim()) {
    return '';
  }
  const format =
    inputFormat === 'auto' ? detectTableFormat(input) : inputFormat;
  const rows = parseTable(input, format);
  if (rows.length === 0) {
    throw new Error('No table data could be parsed from the input');
  }
  return formatTable(rows, outputFormat);
}
