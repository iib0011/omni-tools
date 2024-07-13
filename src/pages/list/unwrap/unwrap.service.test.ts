import { describe, expect, it } from 'vitest';
import { unwrapList } from './service';

describe('unwrapList function', () => {
  it('should unwrap elements correctly with symbol split', () => {
    const input = '##Hello##\n##World##';
    const result = unwrapList(
      'symbol',
      input,
      '\n',
      ' ',
      true,
      true,
      true,
      '#',
      '#'
    );
    expect(result).toBe('Hello World');
  });

  it('should unwrap elements correctly with regex split', () => {
    const input = '##Hello##||##World##';
    const result = unwrapList(
      'regex',
      input,
      '\\|\\|',
      ' ',
      true,
      true,
      true,
      '#',
      '#'
    );
    expect(result).toBe('Hello World');
  });

  it('should handle multiple levels of unwrapping', () => {
    const input = '###Hello###';
    const result = unwrapList(
      'symbol',
      input,
      '\n',
      ' ',
      true,
      true,
      true,
      '#',
      '#'
    );
    expect(result).toBe('Hello');
  });

  it('should handle single level of unwrapping', () => {
    const input = '###Hello###';
    const result = unwrapList(
      'symbol',
      input,
      '\n',
      ' ',
      true,
      false,
      true,
      '#',
      '#'
    );
    expect(result).toBe('##Hello##');
  });

  it('should delete empty items', () => {
    const input = '##Hello##\n\n##World##';
    const result = unwrapList(
      'symbol',
      input,
      '\n',
      ' ',
      true,
      true,
      true,
      '#',
      '#'
    );
    expect(result).toBe('Hello World');
  });

  it('should keep empty items if deleteEmptyItems is false', () => {
    const input = '##Hello##\n\n##World##';
    const result = unwrapList(
      'symbol',
      input,
      '\n',
      ' ',
      false,
      true,
      true,
      '#',
      '#'
    );
    expect(result).toBe('Hello  World');
  });

  it('should trim items', () => {
    const input = '##  Hello  ##\n##  World  ##';
    const result = unwrapList(
      'symbol',
      input,
      '\n',
      ' ',
      true,
      true,
      true,
      '#',
      '#'
    );
    expect(result).toBe('Hello World');
  });

  it('should handle no left or right unwrapping', () => {
    const input = 'Hello\nWorld';
    const result = unwrapList('symbol', input, '\n', ' ', true, true, true);
    expect(result).toBe('Hello World');
  });

  it('should handle mixed levels of unwrapping', () => {
    const input = '###Hello##\n#World###';
    const result = unwrapList(
      'symbol',
      input,
      '\n',
      ' ',
      true,
      true,
      true,
      '#',
      '#'
    );
    expect(result).toBe('Hello World');
  });

  it('should handle complex regex split', () => {
    const input = '##Hello##||###World###||####Test####';
    const result = unwrapList(
      'regex',
      input,
      '\\|\\|',
      ' ',
      true,
      true,
      true,
      '#',
      '#'
    );
    expect(result).toBe('Hello World Test');
  });

  it('should handle different joinSeparator', () => {
    const input = '##Hello##\n##World##';
    const result = unwrapList(
      'symbol',
      input,
      '\n',
      '-',
      true,
      true,
      true,
      '#',
      '#'
    );
    expect(result).toBe('Hello-World');
  });
});
