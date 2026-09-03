import { describe, expect, it } from 'vitest';
import { convertTable, detectTableFormat } from './service';

describe('convertTable', () => {
  it('converts a markdown table to CSV', () => {
    const input = `| Name  | Age |
| ----- | --- |
| John  | 30  |
| Alice | 25  |`;
    const result = convertTable(input, 'markdown', 'csv');
    expect(result).toBe('Name,Age\nJohn,30\nAlice,25');
  });

  it('converts an HTML table to markdown', () => {
    const input = `<table>
  <tr><th>Product</th><th>Price</th></tr>
  <tr><td>Apple</td><td>1.99</td></tr>
</table>`;
    const result = convertTable(input, 'html', 'markdown');
    expect(result).toBe('| Product | Price |\n| --- | --- |\n| Apple | 1.99 |');
  });

  it('converts a MySQL result table to markdown', () => {
    const input = `+----+-------+
| id | name  |
+----+-------+
| 1  | John  |
| 2  | Alice |
+----+-------+`;
    const result = convertTable(input, 'mysql', 'markdown');
    expect(result).toBe(
      '| id | name |\n| --- | --- |\n| 1 | John |\n| 2 | Alice |'
    );
  });

  it('converts CSV to JSON', () => {
    const input = 'name,age\nJohn,30\nAlice,25';
    const result = convertTable(input, 'csv', 'json');
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
    const result = convertTable(input, 'json', 'csv');
    expect(result).toBe('name,age\nJohn,30\nAlice,25');
  });

  it('converts markdown to a MySQL-style ASCII table', () => {
    const input = `| a | bb |
| --- | --- |
| 1 | 2 |`;
    const result = convertTable(input, 'markdown', 'mysql');
    expect(result).toBe(
      '+---+----+\n| a | bb |\n+---+----+\n| 1 | 2  |\n+---+----+'
    );
  });

  it('returns an empty string for empty input', () => {
    expect(convertTable('', 'auto', 'csv')).toBe('');
  });

  it('throws for html input without a table', () => {
    expect(() => convertTable('<div>no table</div>', 'html', 'csv')).toThrow();
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
  });
});
