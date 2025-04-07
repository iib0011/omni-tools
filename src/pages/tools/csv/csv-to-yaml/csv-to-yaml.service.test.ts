import { describe, it, expect } from 'vitest';
import { main } from './service';
import { InitialValuesType } from './types';

// filepath: c:\CODE\omni-tools\src\pages\tools\csv\csv-to-yaml\csv-to-yaml.service.test.ts
describe('main', () => {
  const defaultOptions: InitialValuesType = {
    csvSeparator: ',',
    quoteCharacter: '"',
    commentCharacter: '#',
    emptyLines: false,
    headerRow: true,
    spaces: 2
  };

  it('should return empty string for empty input', () => {
    const result = main('', defaultOptions);
    expect(result).toEqual('');
  });

  it('should return this if header is set to false', () => {
    const options = { ...defaultOptions, headerRow: false };
    const result = main('John,30\nEmma,50', options);
    expect(result).toEqual('-\n  - John\n  - 30\n-\n  - Emma\n  - 50');
  });

  it('should return this header is set to true', () => {
    const options = { ...defaultOptions };
    const result = main('Name,Age\nJohn,30\nEmma,50', options);
    expect(result).toEqual(
      '-\n  Name: John\n  Age: 30\n-\n  Name: Emma\n  Age: 50'
    );
  });

  it('should return this header is set to true and comment flag set', () => {
    const options = { ...defaultOptions, commentcharacter: '#' };
    const result = main('Name,Age\nJohn,30\n#Emma,50', options);
    expect(result).toEqual('-\n  Name: John\n  Age: 30');
  });

  it('should return this header is set to true and spaces is set to 3', () => {
    const options = { ...defaultOptions, spaces: 3 };
    const result = main('Name,Age\nJohn,30\nEmma,50', options);
    expect(result).toEqual(
      '-\n   Name: John\n   Age: 30\n-\n   Name: Emma\n   Age: 50'
    );
  });
});
