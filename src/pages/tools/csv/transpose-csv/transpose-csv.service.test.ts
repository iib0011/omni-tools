import { expect, describe, it } from 'vitest';
import { transposeCSV } from './service';
import { InitialValuesType } from './types';

describe('transposeCsv', () => {
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
