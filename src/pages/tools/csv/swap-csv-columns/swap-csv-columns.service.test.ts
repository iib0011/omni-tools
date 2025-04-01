import { describe, it, expect } from 'vitest';
import { InitialValuesType } from './types';
import { csvColumnsSwap } from './service';

describe('csvColumnsSwap', () => {
  it('should swap columns by position', () => {
    const input = 'A,B,C\n1,2,3\n4,5,6';

    const options: InitialValuesType = {
      fromPositionStatus: true, // fromPositionStatus
      fromPosition: '1', // fromPosition
      toPositionStatus: true, // toPositionStatus
      toPosition: '3', // toPosition
      fromHeader: '', // fromHeader
      toHeader: '', // toHeader
      emptyValuesFilling: true, // dataCompletion
      customFiller: '', // customFiller
      deleteComment: false, // deleteComment
      commentCharacter: '#', // commentCharacter
      emptyLines: true // emptyLines
    };

    const result = csvColumnsSwap(input, options);
    expect(result).toBe('C,B,A\n3,2,1\n6,5,4');
  });

  it('should swap columns by header', () => {
    const input = 'A,B,C\n1,2,3\n4,5,6';
    const options: InitialValuesType = {
      fromPositionStatus: false, // fromPositionStatus
      fromPosition: '', // fromPosition
      toPositionStatus: false, // toPositionStatus
      toPosition: '', // toPosition
      fromHeader: 'A', // fromHeader
      toHeader: 'C', // toHeader
      emptyValuesFilling: true, // dataCompletion
      customFiller: '', // customFiller
      deleteComment: false, // deleteComment
      commentCharacter: '#', // commentCharacter
      emptyLines: true // emptyLines
    };
    const result = csvColumnsSwap(input, options);
    expect(result).toBe('C,B,A\n3,2,1\n6,5,4');
  });

  it('should fill missing values with custom filler', () => {
    const input = 'A,B,C\n1,2\n4';
    const options: InitialValuesType = {
      fromPositionStatus: true, // fromPositionStatus
      fromPosition: '1', // fromPosition
      toPositionStatus: true, // toPositionStatus
      toPosition: '3', // toPosition
      fromHeader: '', // fromHeader
      toHeader: '', // toHeader
      emptyValuesFilling: false, // dataCompletion
      customFiller: 'X', // customFiller
      deleteComment: false, // deleteComment
      commentCharacter: '#', // commentCharacter
      emptyLines: true // emptyLines
    };
    const result = csvColumnsSwap(input, options);
    expect(result).toBe('C,B,A\nX,2,1\nX,X,4');
  });

  it('should skip filling missing values', () => {
    const input = 'A,B,C\n1,2\n4';
    const options: InitialValuesType = {
      fromPositionStatus: true, // fromPositionStatus
      fromPosition: '1', // fromPosition
      toPositionStatus: true, // toPositionStatus
      toPosition: '3', // toPosition
      fromHeader: '', // fromHeader
      toHeader: '', // toHeader
      emptyValuesFilling: true, // dataCompletion
      customFiller: '', // customFiller
      deleteComment: false, // deleteComment
      commentCharacter: '#', // commentCharacter
      emptyLines: true // emptyLines
    };
    const result = csvColumnsSwap(input, options);
    expect(result).toBe('C,B,A\n,2,1\n,,4');
  });

  it('should throw an error for invalid column positions', () => {
    const input = 'A,B,C\n1,2,3\n4,5,6';
    const options: InitialValuesType = {
      fromPositionStatus: true, // fromPositionStatus
      fromPosition: '0', // fromPosition
      toPositionStatus: true, // toPositionStatus
      toPosition: '3', // toPosition
      fromHeader: '', // fromHeader
      toHeader: '', // toHeader
      emptyValuesFilling: true, // dataCompletion
      customFiller: '', // customFiller
      deleteComment: false, // deleteComment
      commentCharacter: '#', // commentCharacter
      emptyLines: true // emptyLines
    };
    expect(() => csvColumnsSwap(input, options)).toThrow(
      'Invalid column positions. Check headers or positions.'
    );
  });

  it('should handle empty input gracefully', () => {
    const input = '';
    const options: InitialValuesType = {
      fromPositionStatus: true, // fromPositionStatus
      fromPosition: '1', // fromPosition
      toPositionStatus: true, // toPositionStatus
      toPosition: '3', // toPosition
      fromHeader: '', // fromHeader
      toHeader: '', // toHeader
      emptyValuesFilling: true, // dataCompletion
      customFiller: '', // customFiller
      deleteComment: false, // deleteComment
      commentCharacter: '#', // commentCharacter
      emptyLines: true // emptyLines
    };
    const result = csvColumnsSwap(input, options);
    expect(result).toBe('');
  });

  it('should remove comments if deleteComment is true', () => {
    const input = '# Comment\nA,B,C\n1,2,3\n4,5,6';
    const options: InitialValuesType = {
      fromPositionStatus: true, // fromPositionStatus
      fromPosition: '1', // fromPosition
      toPositionStatus: true, // toPositionStatus
      toPosition: '3', // toPosition
      fromHeader: '', // fromHeader
      toHeader: '', // toHeader
      emptyValuesFilling: true, // dataCompletion
      customFiller: '', // customFiller
      deleteComment: true, // deleteComment
      commentCharacter: '#', // commentCharacter
      emptyLines: true // emptyLines
    };
    const result = csvColumnsSwap(input, options);
    expect(result).toBe('C,B,A\n3,2,1\n6,5,4');
  });
});
