import { describe, it, expect } from 'vitest';
import { csvToTsv } from './service';

describe('csvToTsv', () => {
  it('should convert CSV to TSV with default settings', () => {
    const input = 'a,b,c\n1,2,3\n4,5,6';
    const result = csvToTsv(input, ',', '"', '', true, false);
    expect(result).toBe('a\tb\tc\n1\t2\t3\n4\t5\t6');
  });

  it('should handle quoted values correctly', () => {
    const input = '"a","b","c"\n"1","2","3"';
    const result = csvToTsv(input, ',', '"', '', true, false);
    expect(result).toBe('a\tb\tc\n1\t2\t3');
  });

  it('should remove comments if commentCharacter is set', () => {
    const input = '#comment\na,b,c\n1,2,3';
    const result = csvToTsv(input, ',', '"', '#', true, false);
    expect(result).toBe('\na\tb\tc\n1\t2\t3');
  });

  it('should remove comments if commentCharacter is set, emptyline set to true', () => {
    const input = '#comment\na,b,c\n1,2,3';
    const result = csvToTsv(input, ',', '"', '#', true, true);
    expect(result).toBe('a\tb\tc\n1\t2\t3');
  });

  it('should remove empty lines if emptyLines is true', () => {
    const input = 'a,b,c\n\n1,2,3\n\n4,5,6';
    const result = csvToTsv(input, ',', '"', '', true, true);
    expect(result).toBe('a\tb\tc\n1\t2\t3\n4\t5\t6');
  });

  it('should not unquote if value is not properly quoted', () => {
    const input = '"a,b,c\n\n1,2,3\n\n4,5,6';
    const result = csvToTsv(input, ',', '"', '', true, true);
    expect(result).toBe('"a\tb\tc\n1\t2\t3\n4\t5\t6');
  });

  it('should unquote if value is properly quoted', () => {
    const input = '"a",b,c\n\n1,"2",3\n\n"4",5,6';
    const result = csvToTsv(input, ',', '"', '', true, true);
    expect(result).toBe('a\tb\tc\n1\t2\t3\n4\t5\t6');
  });

  it('should exclude the header if header is false', () => {
    const input = 'a,b,c\n1,2,3\n4,5,6';
    const result = csvToTsv(input, ',', '"', '', false, false);
    expect(result).toBe('1\t2\t3\n4\t5\t6');
  });

  it('should handle empty input gracefully', () => {
    const input = '';
    const result = csvToTsv(input, ',', '"', '', true, false);
    expect(result).toBe('');
  });

  it('should handle input with only comments and empty lines', () => {
    const input = '#comment\n\n#another comment\n';
    const result = csvToTsv(input, ',', '"', '#', true, true);
    expect(result).toBe('');
  });

  it('should handle custom delimiters', () => {
    const input = 'a|b|c\n1|2|3\n4|5|6';
    const result = csvToTsv(input, '|', '"', '', true, false);
    expect(result).toBe('a\tb\tc\n1\t2\t3\n4\t5\t6');
  });

  it('should handle custom quote characters', () => {
    const input = "'a','b','c'\n'1','2','3'";
    const result = csvToTsv(input, ',', "'", '', true, false);
    expect(result).toBe('a\tb\tc\n1\t2\t3');
  });

  it('should handle mixed quoted and unquoted values', () => {
    const input = '"a",b,"c"\n"1",2,"3"';
    const result = csvToTsv(input, ',', '"', '', true, false);
    expect(result).toBe('a\tb\tc\n1\t2\t3');
  });
});
