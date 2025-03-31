import { describe, it, expect } from 'vitest';
import { csvColumnsSwap } from './service';
describe('csvColumnsSwap', () => {
  it('should swap columns by position', () => {
    const input = 'A,B,C\n1,2,3\n4,5,6';
    const result = csvColumnsSwap(
      input,
      true, // fromPositionStatus
      '1', // fromPosition
      true, // toPositionStatus
      '3', // toPosition
      '', // fromHeader
      '', // toHeader
      true, // dataCompletion
      '', // customFiller
      false, // deleteComment
      '#', // commentCharacter
      true // emptyLines
    );
    expect(result).toBe('C,B,A\n3,2,1\n6,5,4');
  });

  it('should swap columns by header', () => {
    const input = 'A,B,C\n1,2,3\n4,5,6';
    const result = csvColumnsSwap(
      input,
      false, // fromPositionStatus
      '', // fromPosition
      false, // toPositionStatus
      '', // toPosition
      'A', // fromHeader
      'C', // toHeader
      true, // dataCompletion
      '', // customFiller
      false, // deleteComment
      '#', // commentCharacter
      true // emptyLines
    );
    expect(result).toBe('C,B,A\n3,2,1\n6,5,4');
  });

  it('should fill missing values with custom filler', () => {
    const input = 'A,B,C\n1,2\n4';
    const result = csvColumnsSwap(
      input,
      true, // fromPositionStatus
      '1', // fromPosition
      true, // toPositionStatus
      '3', // toPosition
      '', // fromHeader
      '', // toHeader
      false, // dataCompletion
      'X', // customFiller
      false, // deleteComment
      '#', // commentCharacter
      true // emptyLines
    );
    expect(result).toBe('C,B,A\nX,2,1\nX,X,4');
  });

  it('should skip filling missing values', () => {
    const input = 'A,B,C\n1,2\n4';
    const result = csvColumnsSwap(
      input,
      true, // fromPositionStatus
      '1', // fromPosition
      true, // toPositionStatus
      '3', // toPosition
      '', // fromHeader
      '', // toHeader
      true, // dataCompletion
      '', // customFiller
      false, // deleteComment
      '#', // commentCharacter
      true // emptyLines
    );
    expect(result).toBe('C,B,A\n,2,1\n,,4');
  });

  it('should throw an error for invalid column positions', () => {
    const input = 'A,B,C\n1,2,3\n4,5,6';
    expect(() =>
      csvColumnsSwap(
        input,
        true, // fromPositionStatus
        '0', // fromPosition
        true, // toPositionStatus
        '3', // toPosition
        '', // fromHeader
        '', // toHeader
        true, // dataCompletion
        '', // customFiller
        false, // deleteComment
        '#', // commentCharacter
        true // emptyLines
      )
    ).toThrow('Invalid column positions. Check headers or positions.');
  });

  it('should handle empty input gracefully', () => {
    const input = '';
    const result = csvColumnsSwap(
      input,
      true, // fromPositionStatus
      '1', // fromPosition
      true, // toPositionStatus
      '3', // toPosition
      '', // fromHeader
      '', // toHeader
      true, // dataCompletion
      '', // customFiller
      false, // deleteComment
      '#', // commentCharacter
      true // emptyLines
    );
    expect(result).toBe('');
  });

  it('should remove comments if deleteComment is true', () => {
    const input = '# Comment\nA,B,C\n1,2,3\n4,5,6';
    const result = csvColumnsSwap(
      input,
      true, // fromPositionStatus
      '1', // fromPosition
      true, // toPositionStatus
      '3', // toPosition
      '', // fromHeader
      '', // toHeader
      true, // dataCompletion
      '', // customFiller
      true, // deleteComment
      '#', // commentCharacter
      true // emptyLines
    );
    expect(result).toBe('C,B,A\n3,2,1\n6,5,4');
  });
});
