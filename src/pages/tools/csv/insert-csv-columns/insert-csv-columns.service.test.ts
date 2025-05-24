import { describe, it, expect } from 'vitest';
import { main } from './service';
import type { InitialValuesType } from './types';

describe('main function', () => {
  const baseOptions: Omit<InitialValuesType, 'csvToInsert'> = {
    commentCharacter: '#',
    separator: ',',
    quoteChar: '"',
    insertingPosition: 'append',
    customFill: false,
    customFillValue: '',
    customPostionOptions: 'headerName',
    headerName: 'age',
    rowNumber: 1
  };

  const originalCsv = `name,age\nAlice,30\nBob,25`;

  it('should return empty string if input or csvToInsert is empty', () => {
    expect(main('', { ...baseOptions, csvToInsert: '' })).toBe('');
    expect(main(originalCsv, { ...baseOptions, csvToInsert: '' })).toBe('');
  });

  it('should append columns at the end', () => {
    const csvToInsert = `email\nalice@mail.com\nbob@mail.com`;
    const result = main(originalCsv, {
      ...baseOptions,
      insertingPosition: 'append',
      csvToInsert
    });
    expect(result).toBe(
      'name,age,email\nAlice,30,alice@mail.com\nBob,25,bob@mail.com'
    );
  });

  it('should prepend columns at the beginning', () => {
    const csvToInsert = `email\nalice@mail.com\nbob@mail.com`;
    const result = main(originalCsv, {
      ...baseOptions,
      insertingPosition: 'prepend',
      csvToInsert
    });
    expect(result).toBe(
      'email,name,age\nalice@mail.com,Alice,30\nbob@mail.com,Bob,25'
    );
  });

  it('should insert columns after a header name', () => {
    const csvToInsert = `email\nalice@mail.com\nbob@mail.com`;
    const result = main(originalCsv, {
      ...baseOptions,
      insertingPosition: 'custom',
      customPostionOptions: 'headerName',
      headerName: 'name',
      csvToInsert
    });
    expect(result).toBe(
      'name,email,age\nAlice,alice@mail.com,30\nBob,bob@mail.com,25'
    );
  });

  it('should insert columns after a row number (column index)', () => {
    const csvToInsert = `email\nalice@mail.com\nbob@mail.com`;
    const result = main(originalCsv, {
      ...baseOptions,
      insertingPosition: 'custom',
      customPostionOptions: 'rowNumber',
      rowNumber: 0,
      csvToInsert
    });
    expect(result).toBe(
      'name,email,age\nAlice,alice@mail.com,30\nBob,bob@mail.com,25'
    );
  });

  it('should handle missing values and fill with empty string by default', () => {
    const csv = `name\nAlice\nBob`;
    const csvToInsert = `email\nalice@mail.com\n`; // second row is missing
    const result = main(csv, {
      ...baseOptions,
      insertingPosition: 'append',
      csvToInsert
    });
    expect(result).toBe('name,email\nAlice,alice@mail.com\nBob,');
  });
});
