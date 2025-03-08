import { describe, expect, it } from 'vitest';
import { repeatText } from './service';
import { initialValues } from './initialValues';

describe('repeatText function', () => {
  it('should repeat the letter correctly', () => {
    const text = 'i';
    const repeatAmount = '5';
    const result = repeatText({ ...initialValues, repeatAmount }, text);
    expect(result).toBe('iiiii');
  });

  it('should repeat the word correctly', () => {
    const text = 'hello';
    const repeatAmount = '3';
    const result = repeatText({ ...initialValues, repeatAmount }, text);
    expect(result).toBe('hellohellohello');
  });

  it('should repeat the word with a space delimiter correctly', () => {
    const text = 'word';
    const repeatAmount = '3';
    const delimiter = ' ';
    const result = repeatText(
      { ...initialValues, repeatAmount, delimiter },
      text
    );
    expect(result).toBe('word word word');
  });

  it('should repeat the word with a space and a comma delimiter correctly', () => {
    const text = 'test';
    const repeatAmount = '3';
    const delimiter = ', ';
    const result = repeatText(
      { ...initialValues, repeatAmount, delimiter },
      text
    );
    expect(result).toBe('test, test, test');
  });

  it('Should not repeat text if repeatAmount is zero', () => {
    const text = 'something';
    const repeatAmount = '0';
    const result = repeatText({ ...initialValues, repeatAmount }, text);
    expect(result).toBe('');
  });

  it('Should not repeat text if repeatAmount is not entered', () => {
    const text = 'something';
    const repeatAmount = '';
    const result = repeatText({ ...initialValues, repeatAmount }, text);
    expect(result).toBe('');
  });
});
