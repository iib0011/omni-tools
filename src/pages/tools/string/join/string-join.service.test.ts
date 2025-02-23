import { describe, expect, it } from 'vitest';
import { mergeText } from './service';

describe('mergeText', () => {
  it('should merge lines with default settings (delete blank lines, delete trailing spaces, join with empty string)', () => {
    const input = 'line1  \n  \nline2\nline3  \n\nline4';
    const expected = 'line1line2line3line4';
    expect(mergeText(input)).toBe(expected);
  });

  it('should merge lines and preserve blank lines when deleteBlankLines is false', () => {
    const input = 'line1  \n  \nline2\nline3  \n\nline4';
    const expected = 'line1line2line3line4';
    expect(mergeText(input, false, true, '')).toBe(expected);
  });

  it('should merge lines and preserve trailing spaces when deleteTrailingSpaces is false', () => {
    const input = 'line1  \n  \nline2\nline3  \n\nline4';
    const expected = 'line1  line2line3  line4';
    expect(mergeText(input, true, false)).toBe(expected);
  });

  it('should merge lines, preserve blank lines and trailing spaces when both deleteBlankLines and deleteTrailingSpaces are false', () => {
    const input = 'line1  \n  \nline2\nline3  \n\nline4';
    const expected = 'line1    line2line3  line4';
    expect(mergeText(input, false, false)).toBe(expected);
  });

  it('should merge lines with a specified joinCharacter', () => {
    const input = 'line1  \n  \nline2\nline3  \n\nline4';
    const expected = 'line1 line2 line3 line4';
    expect(mergeText(input, true, true, ' ')).toBe(expected);
  });

  it('should handle empty input', () => {
    const input = '';
    const expected = '';
    expect(mergeText(input)).toBe(expected);
  });

  it('should handle input with only blank lines', () => {
    const input = '  \n  \n\n';
    const expected = '';
    expect(mergeText(input)).toBe(expected);
  });

  it('should handle input with only trailing spaces', () => {
    const input = 'line1  \nline2  \nline3  ';
    const expected = 'line1line2line3';
    expect(mergeText(input)).toBe(expected);
  });

  it('should handle single line input', () => {
    const input = 'single line';
    const expected = 'single line';
    expect(mergeText(input)).toBe(expected);
  });

  it('should join lines with new line character when joinCharacter is set to "\\n"', () => {
    const input = 'line1  \n  \nline2\nline3  \n\nline4';
    const expected = 'line1\nline2\nline3\nline4';
    expect(mergeText(input, true, true, '\n')).toBe(expected);
  });
});
