import { describe, expect, it } from 'vitest';
import { parsePageRanges } from './service';

describe('rotate-pdf', () => {
  describe('parsePageRanges', () => {
    it('should return all pages when pageRanges is empty', () => {
      const result = parsePageRanges('', 5);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should parse single page numbers', () => {
      const result = parsePageRanges('1,3,5', 5);
      expect(result).toEqual([1, 3, 5]);
    });

    it('should parse page ranges', () => {
      const result = parsePageRanges('2-4', 5);
      expect(result).toEqual([2, 3, 4]);
    });

    it('should parse mixed page numbers and ranges', () => {
      const result = parsePageRanges('1,3-5', 5);
      expect(result).toEqual([1, 3, 4, 5]);
    });

    it('should ignore invalid page numbers', () => {
      const result = parsePageRanges('1,8,3', 5);
      expect(result).toEqual([1, 3]);
    });

    it('should handle whitespace', () => {
      const result = parsePageRanges(' 1, 3 - 5 ', 5);
      expect(result).toEqual([1, 3, 4, 5]);
    });
  });
});
