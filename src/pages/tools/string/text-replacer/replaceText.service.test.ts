import { describe, expect, it } from 'vitest';
import { replaceText } from './service';
import { initialValues } from './initialValues';

describe('replaceText function (text mode)', () => {
  const mode = 'text';

  it('should replace the word in the text correctly', () => {
    const text = 'Lorem ipsum odor amet, consectetuer adipiscing elit.';
    const searchValue = 'ipsum';
    const replaceValue = 'vitae';
    const result = replaceText(
      { ...initialValues, searchValue, replaceValue, mode },
      text
    );
    expect(result).toBe('Lorem vitae odor amet, consectetuer adipiscing elit.');
  });

  it('should replace letters in the text correctly', () => {
    const text =
      'Luctus penatibus montes elementum lacus mus vivamus lacus laoreet.';
    const searchValue = 'e';
    const replaceValue = 'u';
    const result = replaceText(
      { ...initialValues, searchValue, replaceValue, mode },
      text
    );
    expect(result).toBe(
      'Luctus punatibus montus ulumuntum lacus mus vivamus lacus laoruut.'
    );
  });

  it('should return the original text if one of the required arguments is an empty string', () => {
    const text =
      'Nostra netus quisque ornare neque dolor sem nostra venenatis.';
    expect(
      replaceText(
        { ...initialValues, searchValue: '', replaceValue: 'test', mode },
        text
      )
    ).toBe('Nostra netus quisque ornare neque dolor sem nostra venenatis.');
    expect(
      replaceText(
        { ...initialValues, searchValue: 'ornare', replaceValue: 'test', mode },
        ''
      )
    ).toBe('');
  });

  it('should replace multiple occurrences of the word correctly', () => {
    const text = 'apple orange apple banana apple';
    const searchValue = 'apple';
    const replaceValue = 'grape';
    const result = replaceText(
      { ...initialValues, searchValue, replaceValue, mode },
      text
    );
    expect(result).toBe('grape orange grape banana grape');
  });

  it('should return the original text if the replace value is an empty string', () => {
    const text = 'apple orange apple banana apple';
    const searchValue = 'apple';
    const replaceValue = '';
    const result = replaceText(
      { ...initialValues, searchValue, replaceValue, mode },
      text
    );
    expect(result).toBe(' orange  banana ');
  });

  it('should return the original text if the search value is not found', () => {
    const text = 'apple orange banana';
    const searchValue = 'grape';
    const replaceValue = 'melon';
    const result = replaceText(
      { ...initialValues, searchValue, replaceValue, mode },
      text
    );
    expect(result).toBe('apple orange banana');
  });
});

describe('replaceText function (regexp mode)', () => {
  const mode = 'regexp';

  it('should replace a word in text using regexp correctly', () => {
    const text = 'Egestas lobortis facilisi convallis rhoncus nunc.';
    const searchRegexp = '/nunc/';
    const replaceValue = 'hello';
    const result = replaceText(
      { ...initialValues, searchRegexp, replaceValue, mode },
      text
    );
    expect(result).toBe('Egestas lobortis facilisi convallis rhoncus hello.');
  });

  it('should replace all words in the text with regexp correctly', () => {
    const text =
      'Parturient porta ultricies tellus ultricies suscipit quisque torquent.';
    const searchRegexp = '/ultricies/g';
    const replaceValue = 'hello';
    const result = replaceText(
      { ...initialValues, searchRegexp, replaceValue, mode },
      text
    );
    expect(result).toBe(
      'Parturient porta hello tellus hello suscipit quisque torquent.'
    );
  });

  it('should replace words in text with regexp using alternation operator correctly', () => {
    const text =
      'Commodo maximus nullam dis placerat fermentum curabitur semper.';
    const searchRegexp = '/nullam|fermentum/g';
    const replaceValue = 'test';
    const result = replaceText(
      { ...initialValues, searchRegexp, replaceValue, mode },
      text
    );
    expect(result).toBe(
      'Commodo maximus test dis placerat test curabitur semper.'
    );
  });

  it('should return the original text when passed an invalid regexp', () => {
    const text =
      'Commodo maximus nullam dis placerat fermentum curabitur semper.';
    const searchRegexp = '/(/';
    const replaceValue = 'test';
    const result = replaceText(
      { ...initialValues, searchRegexp, replaceValue, mode },
      text
    );
    expect(result).toBe(
      'Commodo maximus nullam dis placerat fermentum curabitur semper.'
    );
  });

  it('should remove brackets from text correctly using regexp', () => {
    const text =
      'Porta nulla (magna) lectus, [taciti] habitant nunc urna maximus metus.';
    const searchRegexp = '/[()\\[\\]]/g';
    const replaceValue = '';
    const result = replaceText(
      { ...initialValues, searchRegexp, replaceValue, mode },
      text
    );
    expect(result).toBe(
      'Porta nulla magna lectus, taciti habitant nunc urna maximus metus.'
    );
  });

  it('should replace case-insensitive words correctly', () => {
    const text = 'Porta cras ad laoreet porttitor feRmeNtum consectetur?';
    const searchRegexp = '/porta|fermentum/gi';
    const replaceValue = 'test';
    const result = replaceText(
      { ...initialValues, searchRegexp, replaceValue, mode },
      text
    );
    expect(result).toBe('test cras ad laoreet porttitor test consectetur?');
  });

  it('should replace words with digits and symbols correctly', () => {
    const text = 'The price is 100$, and the discount is 20%.';
    const searchRegexp = '/\\d+/g';
    const replaceValue = 'X';
    const result = replaceText(
      { ...initialValues, searchRegexp, replaceValue, mode },
      text
    );
    expect(result).toBe('The price is X$, and the discount is X%.');
  });
});
