import { describe, expect, it } from 'vitest';
import { convertTable, detectTableFormat } from './service';
import { InitialValuesType, TableFormat } from './types';

const convert = (
  input: string,
  inputFormat: TableFormat | 'auto',
  outputFormat: TableFormat
): string => {
  const values: InitialValuesType = {
    autodetect: inputFormat === 'auto',
    // when autodetect is on, inputFormat must be ignored
    inputFormat: inputFormat === 'auto' ? 'csv' : inputFormat,
    outputFormat
  };
  return convertTable(input, values);
};

describe('convertTable', () => {
  it('converts a markdown table to CSV', () => {
    const input = `| Name  | Age |
| ----- | --- |
| John  | 30  |
| Alice | 25  |`;
    expect(convert(input, 'markdown', 'csv')).toBe(
      'Name,Age\nJohn,30\nAlice,25'
    );
  });

  it('converts a MySQL result table to markdown', () => {
    const input = `+----+-------+
| id | name  |
+----+-------+
| 1  | John  |
| 2  | Alice |
+----+-------+`;
    expect(convert(input, 'mysql', 'markdown')).toBe(
      '| id | name |\n| --- | --- |\n| 1 | John |\n| 2 | Alice |'
    );
  });

  it('converts CSV to JSON', () => {
    const result = convert('name,age\nJohn,30\nAlice,25', 'csv', 'json');
    expect(JSON.parse(result)).toEqual([
      { name: 'John', age: '30' },
      { name: 'Alice', age: '25' }
    ]);
  });

  it('converts JSON to CSV', () => {
    const input = JSON.stringify([
      { name: 'John', age: 30 },
      { name: 'Alice', age: 25 }
    ]);
    expect(convert(input, 'json', 'csv')).toBe('name,age\nJohn,30\nAlice,25');
  });

  it('converts markdown to a MySQL-style ASCII table', () => {
    const input = `| a | bb |
| --- | --- |
| 1 | 2 |`;
    expect(convert(input, 'markdown', 'mysql')).toBe(
      '+---+----+\n| a | bb |\n+---+----+\n| 1 | 2  |\n+---+----+'
    );
  });

  it('returns an empty string for empty input', () => {
    expect(convert('', 'auto', 'csv')).toBe('');
  });

  it('throws for html input without a table', () => {
    expect(() => convert('<div>no table</div>', 'html', 'csv')).toThrow();
  });

  describe('autodetect', () => {
    it('detects the input format when autodetect is on', () => {
      const input = '| a | b |\n| --- | --- |\n| 1 | 2 |';
      expect(convert(input, 'auto', 'csv')).toBe('a,b\n1,2');
    });

    it('ignores the detected format when autodetect is off', () => {
      // markdown-looking text forced through the csv parser: one column
      const input = '| a | b |\n| --- | --- |\n| 1 | 2 |';
      const forced = convertTable(input, {
        autodetect: false,
        inputFormat: 'csv',
        outputFormat: 'json'
      });
      expect(JSON.parse(forced)).not.toEqual(
        JSON.parse(convert(input, 'markdown', 'json'))
      );
    });
  });

  describe('edge cases', () => {
    it('escapes HTML special characters in cells', () => {
      const result = convert('a\n<b>&</b>', 'csv', 'html');
      expect(result).toContain('&lt;b&gt;&amp;&lt;/b&gt;');
      expect(result).not.toContain('<b>');
    });

    it('escapes pipes in markdown cells and round-trips them', () => {
      const markdown = convert('a,b\n"x|y",2', 'csv', 'markdown');
      expect(markdown).toContain('x\\|y');
      expect(convert(markdown, 'markdown', 'csv')).toBe('a,b\nx|y,2');
    });

    it('quotes CSV fields containing commas, quotes and newlines', () => {
      const input = JSON.stringify([{ a: 'x,y', b: 'say "hi"', c: 'l1\nl2' }]);
      expect(convert(input, 'json', 'csv')).toBe(
        'a,b,c\n"x,y","say ""hi""","l1\nl2"'
      );
    });

    it('pads ragged rows so every output stays rectangular', () => {
      expect(convert('a,b,c\n1,2', 'csv', 'csv')).toBe('a,b,c\n1,2,');
    });

    it('accepts a single JSON object', () => {
      expect(convert('{"a":1,"b":2}', 'json', 'csv')).toBe('a,b\n1,2');
    });

    it('accepts JSON Lines', () => {
      expect(convert('{"a":1}\n{"a":2}', 'json', 'csv')).toBe('a\n1\n2');
    });

    it('stringifies nested JSON values instead of [object Object]', () => {
      const result = convert('[{"a":{"x":1}}]', 'json', 'csv');
      expect(result).not.toContain('[object Object]');
      expect(result).toContain('x');
    });

    it('aligns MySQL columns by character count, not UTF-16 length', () => {
      const lines = convert('a,b\n😀,1', 'csv', 'mysql').split('\n');
      const widths = new Set(lines.map((line) => Array.from(line).length));
      expect(widths.size).toBe(1);
    });
  });

  describe('detectTableFormat', () => {
    it('detects markdown tables', () => {
      expect(detectTableFormat('| a | b |\n| --- | --- |')).toBe('markdown');
    });

    it('detects mysql ascii tables', () => {
      expect(detectTableFormat('+---+---+\n| a | b |\n+---+---+')).toBe(
        'mysql'
      );
    });

    it('detects html tables', () => {
      expect(detectTableFormat('<table><tr><td>a</td></tr></table>')).toBe(
        'html'
      );
    });

    it('detects json arrays', () => {
      expect(detectTableFormat('[{"a":1}]')).toBe('json');
    });

    it('detects tsv', () => {
      expect(detectTableFormat('a\tb\n1\t2')).toBe('tsv');
    });

    it('falls back to csv', () => {
      expect(detectTableFormat('a,b\n1,2')).toBe('csv');
    });

    it('does not mistake a CSV with a pipe in a field for markdown', () => {
      expect(detectTableFormat('name,a|b\n1,2')).toBe('csv');
    });
  });
});
