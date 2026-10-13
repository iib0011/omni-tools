import { splitCsv } from '@utils/csv';
import { parseJsonInput } from '@utils/json';
import { escapeMarkup } from '@utils/string';
import { InitialValuesType, TableFormat } from './types';

type TableRows = string[][];

function assertNever(value: never): never {
  throw new Error(`Unsupported format: ${String(value)}`);
}

/** Pads every row to the widest one so all formats get a rectangular table. */
function normalizeRows(rows: TableRows): TableRows {
  const width = rows.reduce((max, row) => Math.max(max, row.length), 0);
  return rows.map((row) =>
    Array.from({ length: width }, (_, i) => row[i] ?? '')
  );
}

function uniqueHeaders(headers: string[]): string[] {
  const seen = new Map<string, number>();
  return headers.map((header) => {
    const count = (seen.get(header) ?? 0) + 1;
    seen.set(header, count);
    return count === 1 ? header : `${header}_${count}`;
  });
}

const displayLength = (text: string): number => Array.from(text).length;
const singleLine = (text: string): string => text.replace(/\r?\n/g, ' ');

function cellToString(value: unknown): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/* -------------------------------------------------------------------------- */
/* Parsing                                                                    */
/* -------------------------------------------------------------------------- */

const SEPARATOR_CELL = /^:?-+:?$/;

function isSeparatorRow(cells: string[]): boolean {
  return cells.length > 0 && cells.every((cell) => SEPARATOR_CELL.test(cell));
}

function parseDelimited(input: string, delimiter: string): TableRows {
  return splitCsv(input, false, '', true, delimiter).filter(
    (row) => row.length > 0
  );
}

function splitPipeRow(line: string): string[] {
  return line
    .replace(/^\|/, '')
    .replace(/(?<!\\)\|$/, '')
    .split(/(?<!\\)\|/) // split on unescaped pipes only
    .map((cell) =>
      cell
        .trim()
        .replace(/\\\|/g, '|')
        .replace(/<br\s*\/?>/gi, '\n')
    );
}

function parsePipeDelimited(input: string): TableRows {
  const rows: TableRows = [];
  for (const line of input.split(/\r?\n/)) {
    const trimmed = line.trim();
    // skip empty lines and mysql/ascii border lines like +---+---+
    if (!trimmed || /^\+[-+]*\+$/.test(trimmed)) continue;
    rows.push(splitPipeRow(trimmed));
  }
  // markdown separator row (|---|:---:|) is only valid right after the header
  if (rows.length > 1 && isSeparatorRow(rows[1])) {
    rows.splice(1, 1);
  }
  return rows;
}

function parseHtml(input: string): TableRows {
  const doc = new DOMParser().parseFromString(input, 'text/html');
  const table = doc.querySelector('table');
  if (!table) {
    throw new Error('No <table> element found in the input');
  }

  return Array.from(table.rows)
    .map((tr) =>
      Array.from(tr.cells).map((cell) => (cell.textContent ?? '').trim())
    )
    .filter((cells) => cells.length > 0);
}

function parseJson(input: string): TableRows {
  const { data } = parseJsonInput(input);
  const items = Array.isArray(data) ? data : [data];

  // array of arrays: already rows
  if (items.length > 0 && items.every(Array.isArray)) {
    return (items as unknown[][]).map((row) => row.map(cellToString));
  }

  // array of primitives: single column
  if (items.every((item) => item === null || typeof item !== 'object')) {
    return [['value'], ...items.map((item) => [cellToString(item)])];
  }

  const headers = new Set<string>();
  for (const item of items) {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      Object.keys(item).forEach((key) => headers.add(key));
    }
  }
  const columns = [...headers];

  return [
    columns,
    ...items.map((item) =>
      columns.map((key) =>
        cellToString((item as Record<string, unknown> | null)?.[key])
      )
    )
  ];
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
    default:
      return assertNever(format);
  }
}

/* -------------------------------------------------------------------------- */
/* Detection                                                                  */
/* -------------------------------------------------------------------------- */

const MARKDOWN_SEPARATOR_LINE = /^\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?$/;

const countChar = (text: string, char: string): number =>
  text.split(char).length - 1;

export function detectTableFormat(input: string): TableFormat {
  const trimmed = input.trim();

  if (/<table[\s>]/i.test(trimmed)) return 'html';
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) return 'json';

  const [firstLine = '', secondLine = ''] = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim());

  if (/^\+[-+]+\+$/.test(firstLine)) return 'mysql';

  // a lone pipe in a CSV field is not enough: require a leading pipe
  // or a separator row right below the header
  if (
    firstLine.startsWith('|') ||
    (firstLine.includes('|') &&
      secondLine.includes('-') &&
      MARKDOWN_SEPARATOR_LINE.test(secondLine))
  ) {
    return 'markdown';
  }

  // whichever delimiter appears most often wins
  if (countChar(firstLine, '\t') > countChar(firstLine, ',')) return 'tsv';
  return 'csv';
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

function escapeCsvField(field: string, delimiter: string): string {
  const needsQuotes =
    field.includes(delimiter) ||
    /["\r\n]/.test(field) ||
    field !== field.trim();
  return needsQuotes ? `"${field.replace(/"/g, '""')}"` : field;
}

function toDelimited(rows: TableRows, delimiter: string): string {
  return rows
    .map((row) =>
      row.map((cell) => escapeCsvField(cell, delimiter)).join(delimiter)
    )
    .join('\n');
}

function escapeMarkdownCell(cell: string): string {
  return cell.replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function toMarkdown(rows: TableRows): string {
  if (rows.length === 0) return '';
  const [header, ...body] = rows.map((row) => row.map(escapeMarkdownCell));
  const line = (cells: string[]) => `| ${cells.join(' | ')} |`;
  return [line(header), line(header.map(() => '---')), ...body.map(line)].join(
    '\n'
  );
}

function toMysql(rows: TableRows): string {
  if (rows.length === 0) return '';
  const clean = rows.map((row) => row.map(singleLine));
  const widths = clean[0].map((_, col) =>
    clean.reduce((max, row) => Math.max(max, displayLength(row[col])), 0)
  );
  const border = `+${widths.map((w) => '-'.repeat(w + 2)).join('+')}+`;
  const formatRow = (row: string[]) =>
    `| ${row
      .map((cell, col) => cell + ' '.repeat(widths[col] - displayLength(cell)))
      .join(' | ')} |`;

  const [header, ...body] = clean;
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
  const renderRow = (cells: string[], tag: 'th' | 'td') =>
    `    <tr>\n${cells
      .map((cell) => `      <${tag}>${escapeMarkup(cell)}</${tag}>`)
      .join('\n')}\n    </tr>`;

  const bodyRows = body.map((row) => renderRow(row, 'td')).join('\n');
  return [
    '<table>',
    '  <thead>',
    renderRow(header, 'th'),
    '  </thead>',
    '  <tbody>',
    bodyRows,
    '  </tbody>',
    '</table>'
  ].join('\n');
}

function toJson(rows: TableRows): string {
  if (rows.length === 0) return '[]';
  const [header, ...body] = rows;
  const keys = uniqueHeaders(header);
  const data = body.map((row) =>
    Object.fromEntries(keys.map((key, col) => [key, row[col] ?? '']))
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
    default:
      return assertNever(format);
  }
}

export function convertTable(
  input: string,
  options: InitialValuesType
): string {
  if (!input.trim()) return '';

  const { autodetect, inputFormat, outputFormat } = options;

  const format = autodetect ? detectTableFormat(input) : inputFormat;
  const rows = normalizeRows(parseTable(input, format));

  if (rows.length === 0) {
    throw new Error('No table data could be parsed from the input');
  }
  return formatTable(rows, outputFormat);
}
