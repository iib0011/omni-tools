import { parsePageRanges } from './service';

describe('parsePageRanges', () => {
  test('should return all pages when input is empty', () => {
    expect(parsePageRanges('', 5)).toEqual([1, 2, 3, 4, 5]);
  });

  test('should parse single page numbers', () => {
    expect(parsePageRanges('1,3,5', 5)).toEqual([1, 3, 5]);
  });

  test('should parse page ranges', () => {
    expect(parsePageRanges('2-4', 5)).toEqual([2, 3, 4]);
  });

  test('should parse mixed page numbers and ranges', () => {
    expect(parsePageRanges('1,3-5', 5)).toEqual([1, 3, 4, 5]);
  });

  test('should handle whitespace', () => {
    expect(parsePageRanges(' 1, 3 - 5 ', 5)).toEqual([1, 3, 4, 5]);
  });

  test('should ignore invalid page numbers', () => {
    expect(parsePageRanges('1,a,3', 5)).toEqual([1, 3]);
  });

  test('should ignore out-of-range page numbers', () => {
    expect(parsePageRanges('1,6,3', 5)).toEqual([1, 3]);
  });

  test('should limit ranges to valid pages', () => {
    expect(parsePageRanges('0-6', 5)).toEqual([1, 2, 3, 4, 5]);
  });

  test('should handle reversed ranges', () => {
    expect(parsePageRanges('4-2', 5)).toEqual([2, 3, 4]);
  });

  test('should remove duplicates', () => {
    expect(parsePageRanges('1,1,2,2-4,3', 5)).toEqual([1, 2, 3, 4]);
  });
});
