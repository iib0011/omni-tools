import { expect, describe, it } from 'vitest';

import { rotate, rotateString } from './service'; // Adjust the import path as necessary

describe('rotate function', () => {
  it('rotates right correctly', () => {
    expect(rotate('abcdef', 2, true)).toBe('efabcd');
    expect(rotate('abcdef', 1, true)).toBe('fabcde');
    expect(rotate('abcdef', 6, true)).toBe('abcdef'); // full rotation
    expect(rotate('abcdef', 7, true)).toBe('fabcde'); // beyond full rotation
  });

  it('rotates left correctly', () => {
    expect(rotate('abcdef', 2, false)).toBe('cdefab');
    expect(rotate('abcdef', 1, false)).toBe('bcdefa');
    expect(rotate('abcdef', 6, false)).toBe('abcdef'); // full rotation
    expect(rotate('abcdef', 7, false)).toBe('bcdefa'); // beyond full rotation
  });

  it('handles empty string', () => {
    expect(rotate('', 2, true)).toBe('');
    expect(rotate('', 2, false)).toBe('');
  });

  it('handles single character string', () => {
    expect(rotate('a', 2, true)).toBe('a');
    expect(rotate('a', 2, false)).toBe('a');
  });
});

describe('rotateString function', () => {
  it('rotates single-line string right', () => {
    expect(rotateString('abcdef', 2, true, false)).toBe('efabcd');
  });

  it('rotates single-line string left', () => {
    expect(rotateString('abcdef', 2, false, false)).toBe('cdefab');
  });

  it('rotates multi-line string right', () => {
    const input = 'abcdef\nghijkl';
    const expected = 'efabcd\nklghij';
    expect(rotateString(input, 2, true, true)).toBe(expected);
  });

  it('rotates multi-line string left', () => {
    const input = 'abcdef\nghijkl';
    const expected = 'cdefab\nijklgh';
    expect(rotateString(input, 2, false, true)).toBe(expected);
  });

  it('handles empty string in multi-line mode', () => {
    expect(rotateString('', 2, true, true)).toBe('');
  });

  it('handles single character string in multi-line mode', () => {
    expect(rotateString('a', 2, true, true)).toBe('a');
  });

  it('handles single character string in single-line mode', () => {
    expect(rotateString('a', 2, true, false)).toBe('a');
  });

  it('handles string with multiple empty lines', () => {
    const input = 'abcdef\n\nxyz';
    const expected = 'efabcd\n\nyzx';
    expect(rotateString(input, 2, true, true)).toBe(expected);
  });
});
