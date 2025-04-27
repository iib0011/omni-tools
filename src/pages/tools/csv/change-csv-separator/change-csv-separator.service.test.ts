import { expect, describe, it } from 'vitest';
import { changeCsvSeparator } from './service';
import { InitialValuesType } from './types';

describe('changeCsvSeparator', () => {
  it('should change the separator from comma to semicolon', () => {
    const inputCsv = 'name,age,city\nJohn,30,New York';
    const options: InitialValuesType = {
      inputSeparator: ',',
      inputQuoteCharacter: '"',
      commentCharacter: '#',
      emptyLines: false,
      outputSeparator: ';',
      outputQuoteAll: false,
      OutputQuoteCharacter: '"'
    };
    const result = changeCsvSeparator(inputCsv, options);
    expect(result).toBe('name;age;city\nJohn;30;New York');
  });

  it('should handle empty input gracefully', () => {
    const inputCsv = '';
    const options: InitialValuesType = {
      inputSeparator: ',',
      inputQuoteCharacter: '"',
      commentCharacter: '#',
      emptyLines: false,
      outputSeparator: ';',
      outputQuoteAll: false,
      OutputQuoteCharacter: '"'
    };
    const result = changeCsvSeparator(inputCsv, options);
    expect(result).toBe('');
  });

  it('should not modify the CSV if the separator is already correct', () => {
    const inputCsv = 'name;age;city\nJohn;30;New York';
    const options: InitialValuesType = {
      inputSeparator: ';',
      inputQuoteCharacter: '"',
      commentCharacter: '#',
      emptyLines: false,
      outputSeparator: ';',
      outputQuoteAll: false,
      OutputQuoteCharacter: '"'
    };
    const result = changeCsvSeparator(inputCsv, options);
    expect(result).toBe(inputCsv);
  });

  it('should handle custom separators', () => {
    const inputCsv = 'name|age|city\nJohn|30|New York';
    const options: InitialValuesType = {
      inputSeparator: '|',
      inputQuoteCharacter: '"',
      commentCharacter: '#',
      emptyLines: false,
      outputSeparator: ';',
      outputQuoteAll: false,
      OutputQuoteCharacter: '"'
    };
    const result = changeCsvSeparator(inputCsv, options);
    expect(result).toBe('name;age;city\nJohn;30;New York');
  });

  it('should quote all output values', () => {
    const inputCsv = 'name|age|city\nJohn|30|New York';
    const options: InitialValuesType = {
      inputSeparator: '|',
      inputQuoteCharacter: '"',
      commentCharacter: '#',
      emptyLines: false,
      outputSeparator: ';',
      outputQuoteAll: true,
      OutputQuoteCharacter: '"'
    };
    const result = changeCsvSeparator(inputCsv, options);
    expect(result).toBe('"name";"age";"city"\n"John";"30";"New York"');
  });

  it('should remove quotes from input values', () => {
    const inputCsv = '"name"|"age"|"city"\n"John"|"30"|"New York"';
    const options: InitialValuesType = {
      inputSeparator: '|',
      inputQuoteCharacter: '"',
      commentCharacter: '#',
      emptyLines: false,
      outputSeparator: ';',
      outputQuoteAll: false,
      OutputQuoteCharacter: '"'
    };
    const result = changeCsvSeparator(inputCsv, options);
    expect(result).toBe('name;age;city\nJohn;30;New York');
  });

  it('should handle emptylines', () => {
    const inputCsv = '"name"|"age"|"city"\n\n"John"|"30"|"New York"';
    const options: InitialValuesType = {
      inputSeparator: '|',
      inputQuoteCharacter: '"',
      commentCharacter: '#',
      emptyLines: true,
      outputSeparator: ';',
      outputQuoteAll: false,
      OutputQuoteCharacter: '"'
    };
    const result = changeCsvSeparator(inputCsv, options);
    expect(result).toBe('name;age;city\nJohn;30;New York');
  });

  it('should handle emptylines', () => {
    const inputCsv = '"name"|"age"|"city"\n\n"John"|"30"|"New York"';
    const options: InitialValuesType = {
      inputSeparator: '|',
      inputQuoteCharacter: '"',
      commentCharacter: '#',
      emptyLines: true,
      outputSeparator: ';',
      outputQuoteAll: false,
      OutputQuoteCharacter: '"'
    };
    const result = changeCsvSeparator(inputCsv, options);
    expect(result).toBe('name;age;city\nJohn;30;New York');
  });
});
