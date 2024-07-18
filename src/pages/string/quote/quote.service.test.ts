import { expect, describe, it } from 'vitest';
import { quote, stringQuoter } from './service';

describe('quote function', () => {
  it('quotes a word with single quotes', () => {
    expect(quote('Hello', "'", "'", false)).toBe("'Hello'");
  });

  it('quotes a word with double quotes', () => {
    expect(quote('World', '"', '"', true)).toBe('"World"');
  });

  it('does not re-quote already quoted word', () => {
    expect(quote('"Goodbye"', '"', '"', false)).toBe('"Goodbye"');
  });

  it('handles empty word when emptyQuoting is true', () => {
    expect(quote('', "'", "'", false)).toBe("''");
  });

  it('handles empty word when emptyQuoting is false', () => {
    expect(quote('', "'", "'", false)).toBe("''"); // Replace with expected behavior
  });
});

describe('stringQuoter function', () => {
  it('quotes a multi-line input with single quotes', () => {
    const input = 'Hello\nWorld\n';
    const expected = "'Hello'\n'World'\n''";
    expect(stringQuoter(input, "'", "'", false, true, true)).toBe(expected);
  });

  it('handles empty lines when emptyQuoting is true', () => {
    const input = 'Hello\n\nWorld';
    const expected = "'Hello'\n''\n'World'";
    expect(stringQuoter(input, "'", "'", false, true, true)).toBe(expected);
  });

  it('does not quote empty lines when emptyQuoting is false', () => {
    const input = 'Hello\n\nWorld';
    const expected = "'Hello'\n\n'World'";
    expect(stringQuoter(input, "'", "'", false, false, true)).toBe(expected);
  });

  it('quotes a single-line input with double quotes', () => {
    const input = 'Hello';
    const expected = '"Hello"';
    expect(stringQuoter(input, '"', '"', true, true, false)).toBe(expected);
  });

  it('handles empty input', () => {
    const input = '';
    const expected = '';
    expect(stringQuoter(input, "'", "'", false, true, false)).toBe(expected);
  });

  it('handles spaces input', () => {
    const input = ' ';
    const expected = "' '";
    expect(stringQuoter(input, "'", "'", false, true, false)).toBe(expected);
  });
});
