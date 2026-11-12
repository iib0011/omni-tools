import { expect, describe, it } from 'vitest';
import { transposeCSV } from './service';
import { InitialValuesType } from './types';

describe('transposeCsv', () => {
  it.each([
    [
      'Name,Location\nAlice,"Paris, France"',
      'Name,Alice\nLocation,"Paris, France"',
      ',',
      '"'
    ],
    [
      'Name,Note\nAlice,"She said ""Hello"""',
      'Name,Alice\nNote,"She said ""Hello"""',
      ',',
      '"'
    ],
    [
      "Name|Location\nAlice|'Alice''s place|France'",
      "Name|Alice\nLocation|'Alice''s place|France'",
      '|',
      "'"
    ]
  ])(
    'should preserve quoted fields in %s',
    (input, expected, separator, quoteChar) => {
      const options: InitialValuesType = {
        separator,
        commentCharacter: '#',
        customFill: false,
        customFillValue: 'x',
        quoteChar
      };

      expect(transposeCSV(input, options)).toEqual(expected);
    }
  );

  it('should quote custom fill values that contain the separator', () => {
    const options: InitialValuesType = {
      separator: ',',
      commentCharacter: '#',
      customFill: true,
      customFillValue: 'not, available',
      quoteChar: '"'
    };

    expect(transposeCSV('a,b\n1,2,3', options)).toEqual(
      'a,1\nb,2\n"not, available",3'
    );
  });

  it('should transpose a simple CSV', () => {
    const options: InitialValuesType = {
      separator: ',',
      commentCharacter: '#',
      customFill: false,
      customFillValue: 'x',
      quoteChar: '"'
    };
    const input = 'a,b,c\n1,2,3';
    const expectedOutput = 'a,1\nb,2\nc,3';
    const result = transposeCSV(input, options);
    expect(result).toEqual(expectedOutput);
  });

  it('should handle an empty CSV', () => {
    const options: InitialValuesType = {
      separator: ',',
      commentCharacter: '#',
      customFill: false,
      customFillValue: 'x',
      quoteChar: '"'
    };
    const input = '';
    const expectedOutput = '';
    const result = transposeCSV(input, options);
    expect(result).toEqual(expectedOutput);
  });

  it('should handle a single row CSV', () => {
    const options: InitialValuesType = {
      separator: ',',
      commentCharacter: '#',
      customFill: false,
      customFillValue: 'x',
      quoteChar: '"'
    };
    const input = 'a,b,c';
    const expectedOutput = 'a\nb\nc';
    const result = transposeCSV(input, options);
    expect(result).toEqual(expectedOutput);
  });

  it('should handle a single column CSV', () => {
    const options: InitialValuesType = {
      separator: ',',
      commentCharacter: '#',
      customFill: false,
      customFillValue: 'x',
      quoteChar: '"'
    };
    const input = 'a\nb\nc';
    const expectedOutput = 'a,b,c';
    const result = transposeCSV(input, options);
    expect(result).toEqual(expectedOutput);
  });

  it('should handle uneven rows in the CSV', () => {
    const options: InitialValuesType = {
      separator: ',',
      commentCharacter: '#',
      customFill: true,
      customFillValue: 'x',
      quoteChar: '"'
    };
    const input = 'a,b\n1,2,3';
    const expectedOutput = 'a,1\nb,2\nx,3';
    const result = transposeCSV(input, options);
    expect(result).toEqual(expectedOutput);
  });

  it('should skip comment in  the CSV', () => {
    const options: InitialValuesType = {
      separator: ',',
      commentCharacter: '#',
      customFill: true,
      customFillValue: 'x',
      quoteChar: '"'
    };
    const input = 'a,b\n1,2\n#c,3\nd,4';
    const expectedOutput = 'a,1,d\nb,2,4';
    const result = transposeCSV(input, options);
    expect(result).toEqual(expectedOutput);
  });
});
