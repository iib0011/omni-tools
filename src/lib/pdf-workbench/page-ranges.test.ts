import { describe, expect, it } from 'vitest';
import { WorkbenchError } from './errors';
import { formatPageRanges, parsePageRanges } from './page-ranges';

describe('parsePageRanges', () => {
  it('uses one-based pages, expands ranges, sorts, and removes duplicates', () => {
    expect(parsePageRanges('5, 1-3, 2, 7-8', 8)).toEqual([1, 2, 3, 5, 7, 8]);
  });

  it('selects all pages for an empty value by default', () => {
    expect(parsePageRanges('', 3)).toEqual([1, 2, 3]);
    expect(parsePageRanges('', 3, { empty: 'none' })).toEqual([]);
  });

  it.each(['0', '4', '2-1', '1,,2', '1-', 'all'])(
    'rejects invalid range %s',
    (value) => {
      expect(() => parsePageRanges(value, 3)).toThrow(WorkbenchError);
    }
  );

  it('rejects a document with no pages', () => {
    expect(() => parsePageRanges('', 0)).toThrow(
      'The PDF must contain at least one page.'
    );
  });
});

describe('formatPageRanges', () => {
  it('compacts sorted consecutive pages', () => {
    expect(formatPageRanges([5, 2, 1, 2, 3, 8])).toBe('1-3,5,8');
  });
});
