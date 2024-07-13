import { describe, expect, it } from 'vitest';
import { TopItemsList } from './service';

describe('TopItemsList function', () => {
  it('should handle sorting alphabetically ignoring case', () => {
    const input = 'Apple,banana,apple,Orange,Banana,apple';
    const result = TopItemsList(
      'symbol',
      'alphabetic',
      'count',
      ',',
      input,
      false,
      true,
      false
    );
    expect(result).toEqual('apple: 3\n' + 'banana: 2\n' + 'orange: 1');
  });

  it('should handle sorting by count and not ignoring case', () => {
    const input = 'apple,banana,apple,orange,banana,apple,Banana';
    const result = TopItemsList(
      'symbol',
      'count',
      'count',
      ',',
      input,
      false,
      false,
      false
    );
    expect(result).toEqual(
      'apple: 3\n' + 'banana: 2\n' + 'orange: 1\n' + 'Banana: 1'
    );
  });

  it('should handle regex split operator', () => {
    const input = 'apple123banana456apple789orange012banana345apple678';
    const result = TopItemsList(
      'regex',
      'count',
      'count',
      '\\d+',
      input,
      false,
      false,
      false
    );
    expect(result).toEqual('apple: 3\n' + 'banana: 2\n' + 'orange: 1');
  });

  it('should handle percentage display format', () => {
    const input = 'apple,banana,apple,orange,banana,apple';
    const result = TopItemsList(
      'symbol',
      'count',
      'percentage',
      ',',
      input,
      false,
      false,
      false
    );
    expect(result).toEqual(
      'apple: 3 (50.00%)\n' + 'banana: 2 (33.33%)\n' + 'orange: 1 (16.67%)'
    );
  });

  it('should handle total display format', () => {
    const input = 'apple,banana,apple,orange,banana,apple';
    const result = TopItemsList(
      'symbol',
      'count',
      'total',
      ',',
      input,
      false,
      false,
      false
    );
    expect(result).toEqual(
      'apple: 3 (3 / 6)\n' + 'banana: 2 (2 / 6)\n' + 'orange: 1 (1 / 6)'
    );
  });

  it('should handle trimming and ignoring empty items', () => {
    const input = ' apple , banana , apple , orange , banana , apple ';
    const result = TopItemsList(
      'symbol',
      'count',
      'count',
      ',',
      input,
      true,
      false,
      true
    );
    expect(result).toEqual('apple: 3\n' + 'banana: 2\n' + 'orange: 1');
  });
});
