import { describe, it, expect } from 'vitest';
import { csvRowsToColumns } from './service';

describe('csvRowsToColumns', () => {
  it('should transpose rows to columns', () => {
    const input = 'a,b,c\n1,2,3\nx,y,z';
    const result = csvRowsToColumns(input, false, '', '#');
    expect(result).toBe('a,1,x\nb,2,y\nc,3,z');
  });

  it('should fill empty values with custom filler', () => {
    const input = 'a,b\n1\nx,y,z';
    const result = csvRowsToColumns(input, false, 'FILL', '#');
    expect(result).toBe('a,1,x\nb,FILL,y\nFILL,FILL,z');
  });

  it('should fill empty values with empty strings when emptyValuesFilling is true', () => {
    const input = 'a,b\n1\nx,y,z';
    const result = csvRowsToColumns(input, true, 'FILL', '#');
    expect(result).toBe('a,1,x\nb,,y\n,,z');
  });

  it('should ignore rows starting with the comment character', () => {
    const input = '#comment\n1,2,3\nx,y,z';
    const result = csvRowsToColumns(input, false, '', '#');
    expect(result).toBe('1,x\n2,y\n3,z');
  });

  it('should handle an empty input', () => {
    const input = '';
    const result = csvRowsToColumns(input, false, '', '#');
    expect(result).toBe('');
  });

  it('should handle input with only comments', () => {
    const input = '#comment\n#another comment';
    const result = csvRowsToColumns(input, false, '', '#');
    expect(result).toBe('');
  });

  it('should handle single row input', () => {
    const input = 'a,b,c';
    const result = csvRowsToColumns(input, false, '', '#');
    expect(result).toBe('a\nb\nc');
  });

  it('should handle single column input', () => {
    const input = 'a\nb\nc';
    const result = csvRowsToColumns(input, false, '', '#');
    expect(result).toBe('a,b,c');
  });

  it('should handle this case onlinetools #1', () => {
    const input =
      'Variety,Origin\nArabica,Ethiopia\nRobusta,Africa\nLiberica,Philippines\nMocha,\n//green tea';
    const result = csvRowsToColumns(input, false, '1x', '//');
    expect(result).toBe(
      'Variety,Arabica,Robusta,Liberica,Mocha\nOrigin,Ethiopia,Africa,Philippines,1x'
    );
  });
});
