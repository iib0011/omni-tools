import { describe, it, expect } from 'vitest';
import { convertJsonToCsv } from './service';

const defaultOptions: Parameters<typeof convertJsonToCsv>[1] = {
  delimiter: ',',
  includeHeaders: true,
  quoteStrings: 'auto'
};

describe('convertJsonToCsv', () => {
  describe('basic conversion', () => {
    it('converts a flat array of objects', () => {
      const input = JSON.stringify([
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 }
      ]);

      expect(convertJsonToCsv(input, defaultOptions)).toBe(
        `name,age\r\nAlice,30\r\nBob,25`
      );
    });

    it('converts a single object', () => {
      const input = JSON.stringify({ name: 'Alice', age: 30 });

      expect(convertJsonToCsv(input, defaultOptions)).toBe(
        `name,age\r\nAlice,30`
      );
    });

    it('excludes header row when includeHeaders is false', () => {
      const input = JSON.stringify([{ name: 'Alice', age: 30 }]);

      expect(
        convertJsonToCsv(input, { ...defaultOptions, includeHeaders: false })
      ).toBe(`Alice,30`);
    });
  });

  describe('flattening', () => {
    it('flattens nested objects using dot notation', () => {
      const input = JSON.stringify([
        { name: 'Alice', address: { city: 'Paris', zip: '75000' } }
      ]);

      expect(convertJsonToCsv(input, defaultOptions)).toBe(
        `name,address.city,address.zip\r\nAlice,Paris,75000`
      );
    });

    it('flattens arrays using index notation', () => {
      const input = JSON.stringify([
        { name: 'Alice', tags: ['admin', 'user'] }
      ]);

      expect(convertJsonToCsv(input, defaultOptions)).toBe(
        `name,tags[0],tags[1]\r\nAlice,admin,user`
      );
    });

    it('flattens deeply nested structures', () => {
      const input = JSON.stringify([
        { user: { address: { geo: { lat: 48.8566, lng: 2.3522 } } } }
      ]);

      expect(convertJsonToCsv(input, defaultOptions)).toBe(
        `user.address.geo.lat,user.address.geo.lng\r\n48.8566,2.3522`
      );
    });
  });

  describe('sparse rows', () => {
    it('fills missing keys with empty values', () => {
      const input = JSON.stringify([
        { name: 'Alice', age: 30 },
        { name: 'Bob', city: 'Paris' }
      ]);

      expect(convertJsonToCsv(input, defaultOptions)).toBe(
        `name,age,city\r\nAlice,30,\r\nBob,,Paris`
      );
    });

    it('filters out empty objects', () => {
      const input = JSON.stringify([{}, { name: 'Alice' }]);

      expect(convertJsonToCsv(input, defaultOptions)).toBe(`name\r\nAlice`);
    });
  });

  describe('quoting', () => {
    it('quotes cells containing the delimiter', () => {
      const input = JSON.stringify([{ name: 'Smith, John' }]);

      expect(convertJsonToCsv(input, defaultOptions)).toBe(
        `name\r\n"Smith, John"`
      );
    });

    it('escapes double-quotes by doubling them', () => {
      const input = JSON.stringify([{ name: 'He said "hello"' }]);

      expect(convertJsonToCsv(input, defaultOptions)).toBe(
        `name\r\n"He said ""hello"""`
      );
    });

    it('quotes all cells when quoteStrings is always', () => {
      const input = JSON.stringify([{ name: 'Alice', age: 30 }]);

      expect(
        convertJsonToCsv(input, { ...defaultOptions, quoteStrings: 'always' })
      ).toBe(`"name","age"\r\n"Alice","30"`);
    });

    it('quotes cells containing newlines', () => {
      const input = JSON.stringify([{ notes: 'line1\nline2' }]);

      expect(convertJsonToCsv(input, defaultOptions)).toBe(
        `notes\r\n"line1\nline2"`
      );
    });
  });

  describe('delimiters', () => {
    it('uses semicolon as delimiter', () => {
      const input = JSON.stringify([{ name: 'Alice', age: 30 }]);

      expect(
        convertJsonToCsv(input, { ...defaultOptions, delimiter: ';' })
      ).toBe(`name;age\r\nAlice;30`);
    });

    it('uses tab as delimiter', () => {
      const input = JSON.stringify([{ name: 'Alice', age: 30 }]);

      expect(
        convertJsonToCsv(input, { ...defaultOptions, delimiter: '\t' })
      ).toBe(`name\tage\r\nAlice\t30`);
    });
  });

  describe('null and undefined values', () => {
    it('converts null values to empty strings', () => {
      const input = JSON.stringify([{ name: 'Alice', age: null }]);

      expect(convertJsonToCsv(input, defaultOptions)).toBe(
        `name,age\r\nAlice,`
      );
    });
  });

  describe('errors', () => {
    it('throws on invalid JSON', () => {
      expect(() => convertJsonToCsv('invalid json', defaultOptions)).toThrow(
        'Invalid JSON input.'
      );
    });

    it('throws on bare primitive', () => {
      expect(() => convertJsonToCsv('42', defaultOptions)).toThrow(
        'JSON input must be an object or array of objects, not a bare primitive.'
      );
    });

    it('throws when no data rows are found', () => {
      expect(() =>
        convertJsonToCsv(JSON.stringify([{}, {}]), defaultOptions)
      ).toThrow('No data found in the provided JSON.');
    });
  });
});
