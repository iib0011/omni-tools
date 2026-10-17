import { describe, expect, it } from 'vitest';

import { chunkList, SplitOperatorType } from './service';

describe('chunkList', () => {
  it('splits by symbol, groups, pads, and formats correctly', () => {
    const input = 'a,b,c,d,e,f,g,h,i,j';
    const splitOperatorType: SplitOperatorType = 'symbol';
    const splitSeparator = ',';
    const groupNumber = 3;
    const itemSeparator = '-';
    const leftWrap = '[';
    const rightWrap = ']';
    const groupSeparator = ' | ';
    const deleteEmptyItems = false;
    const padNonFullGroup = true;
    const paddingChar = 'x';

    const expectedOutput = '[a-b-c] | [d-e-f] | [g-h-i] | [j-x-x]';

    const result = chunkList(
      splitOperatorType,
      splitSeparator,
      input,
      groupNumber,
      itemSeparator,
      leftWrap,
      rightWrap,
      groupSeparator,
      deleteEmptyItems,
      padNonFullGroup,
      paddingChar
    );

    expect(result).toBe(expectedOutput);
  });

  it('handles regex split, no padding, and formats correctly', () => {
    const input = 'a1b2c3d4e5f6g7h8i9j';
    const splitOperatorType: SplitOperatorType = 'regex';
    const splitSeparator = '\\d';
    const groupNumber = 4;
    const itemSeparator = ',';
    const leftWrap = '(';
    const rightWrap = ')';
    const groupSeparator = ' / ';
    const deleteEmptyItems = true;
    const padNonFullGroup = false;

    const expectedOutput = '(a,b,c,d) / (e,f,g,h) / (i,j)';

    const result = chunkList(
      splitOperatorType,
      splitSeparator,
      input,
      groupNumber,
      itemSeparator,
      leftWrap,
      rightWrap,
      groupSeparator,
      deleteEmptyItems,
      padNonFullGroup
    );

    expect(result).toBe(expectedOutput);
  });

  it('handles empty items removal and padd the last group with a z', () => {
    const input = 'a,,b,,c,,d,,e,,';
    const splitOperatorType: SplitOperatorType = 'symbol';
    const splitSeparator = ',';
    const groupNumber = 2;
    const itemSeparator = ':';
    const leftWrap = '<';
    const rightWrap = '>';
    const groupSeparator = ' & ';
    const deleteEmptyItems = true;
    const padNonFullGroup = true;
    const paddingChar = 'z';

    const expectedOutput = '<a:b> & <c:d> & <e:z>';

    const result = chunkList(
      splitOperatorType,
      splitSeparator,
      input,
      groupNumber,
      itemSeparator,
      leftWrap,
      rightWrap,
      groupSeparator,
      deleteEmptyItems,
      padNonFullGroup,
      paddingChar
    );

    expect(result).toBe(expectedOutput);
  });
});
