import { describe, expect, it } from 'vitest';
import {
  formatBatesNumber,
  formatPageNumber,
  validateNumberTemplate
} from './formatters';

describe('stamp number formatting', () => {
  it('formats page number tokens and starting number', () => {
    expect(formatPageNumber('Page {current} of {total}', 2, 10, 5)).toBe(
      'Page 7 of 10'
    );
  });

  it('formats Bates prefix, suffix, start, and zero padding', () => {
    expect(formatBatesNumber(2, 42, 6, 'ACME-', '-R')).toBe('ACME-000044-R');
  });

  it('requires at least one supported page token', () => {
    expect(validateNumberTemplate('{current}')).toBe(true);
    expect(validateNumberTemplate('{total} pages')).toBe(true);
    expect(validateNumberTemplate('fixed text')).toBe(false);
  });
});
