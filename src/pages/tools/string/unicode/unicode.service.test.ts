import { expect, describe, it } from 'vitest';
import { unicode } from './service';

describe('unicode', () => {
  it('should encode an English string to lowercase hex correctly', () => {
    const input = 'Hello, World!';
    const result = unicode(input, { mode: 'encode', uppercase: false });
    expect(result).toBe(
      '\\u0048\\u0065\\u006c\\u006c\\u006f\\u002c\\u0020\\u0057\\u006f\\u0072\\u006c\\u0064\\u0021'
    );
  });

  it('should encode an English string to uppercase hex correctly', () => {
    const input = 'Hello, World!';
    const result = unicode(input, { mode: 'encode', uppercase: true });
    expect(result).toBe(
      '\\u0048\\u0065\\u006C\\u006C\\u006F\\u002C\\u0020\\u0057\\u006F\\u0072\\u006C\\u0064\\u0021'
    );
  });

  it('should decode an English lowercase hex string correctly', () => {
    const input =
      '\\u0048\\u0065\\u006c\\u006c\\u006f\\u002c\\u0020\\u0057\\u006f\\u0072\\u006c\\u0064\\u0021';
    const result = unicode(input, { mode: 'decode', uppercase: false });
    expect(result).toBe('Hello, World!');
  });

  it('should decode an English uppercase hex string correctly', () => {
    const input =
      '\\u0048\\u0065\\u006C\\u006C\\u006F\\u002C\\u0020\\u0057\\u006F\\u0072\\u006C\\u0064\\u0021';
    const result = unicode(input, { mode: 'decode', uppercase: false });
    expect(result).toBe('Hello, World!');
  });

  it('should encode a Korean string to lowercase hex correctly', () => {
    const input = '안녕하세요, 세계!';
    const result = unicode(input, { mode: 'encode', uppercase: false });
    expect(result).toBe(
      '\\uc548\\ub155\\ud558\\uc138\\uc694\\u002c\\u0020\\uc138\\uacc4\\u0021'
    );
  });

  it('should encode a Korean string to uppercase hex correctly', () => {
    const input = '안녕하세요, 세계!';
    const result = unicode(input, { mode: 'encode', uppercase: true });
    expect(result).toBe(
      '\\uC548\\uB155\\uD558\\uC138\\uC694\\u002C\\u0020\\uC138\\uACC4\\u0021'
    );
  });

  it('should decode a Korean lowercase hex string correctly', () => {
    const input =
      '\\uc548\\ub155\\ud558\\uc138\\uc694\\u002c\\u0020\\uc138\\uacc4\\u0021';
    const result = unicode(input, { mode: 'decode', uppercase: false });
    expect(result).toBe('안녕하세요, 세계!');
  });

  it('should decode a Korean uppercase hex string correctly', () => {
    const input =
      '\\uC548\\uB155\\uD558\\uC138\\uC694\\u002C\\u0020\\uC138\\uACC4\\u0021';
    const result = unicode(input, { mode: 'decode', uppercase: false });
    expect(result).toBe('안녕하세요, 세계!');
  });

  it('should encode a Japanese string to lowercase hex correctly', () => {
    const input = 'こんにちは、世界！';
    const result = unicode(input, { mode: 'encode', uppercase: false });
    expect(result).toBe(
      '\\u3053\\u3093\\u306b\\u3061\\u306f\\u3001\\u4e16\\u754c\\uff01'
    );
  });

  it('should encode a Japanese string to uppercase hex correctly', () => {
    const input = 'こんにちは、世界！';
    const result = unicode(input, { mode: 'encode', uppercase: true });
    expect(result).toBe(
      '\\u3053\\u3093\\u306B\\u3061\\u306F\\u3001\\u4E16\\u754C\\uFF01'
    );
  });

  it('should decode a Japanese lowercase hex string correctly', () => {
    const input =
      '\\u3053\\u3093\\u306b\\u3061\\u306f\\u3001\\u4e16\\u754c\\uff01';
    const result = unicode(input, { mode: 'decode', uppercase: false });
    expect(result).toBe('こんにちは、世界！');
  });

  it('should decode a Japanese uppercase hex string correctly', () => {
    const input =
      '\\u3053\\u3093\\u306B\\u3061\\u306F\\u3001\\u4E16\\u754C\\uFF01';
    const result = unicode(input, { mode: 'decode', uppercase: false });
    expect(result).toBe('こんにちは、世界！');
  });

  it('should encode a Chinese string to lowercase hex correctly', () => {
    const input = '你好，世界！';
    const result = unicode(input, { mode: 'encode', uppercase: false });
    expect(result).toBe('\\u4f60\\u597d\\uff0c\\u4e16\\u754c\\uff01');
  });

  it('should encode a Chinese string to uppercase hex correctly', () => {
    const input = '你好，世界！';
    const result = unicode(input, { mode: 'encode', uppercase: true });
    expect(result).toBe('\\u4F60\\u597D\\uFF0C\\u4E16\\u754C\\uFF01');
  });

  it('should decode a Chinese lowercase hex string correctly', () => {
    const input = '\\u4f60\\u597d\\uff0c\\u4e16\\u754c\\uff01';
    const result = unicode(input, { mode: 'decode', uppercase: false });
    expect(result).toBe('你好，世界！');
  });

  it('should decode a Chinese uppercase hex string correctly', () => {
    const input = '\\u4F60\\u597D\\uFF0C\\u4E16\\u754C\\uFF01';
    const result = unicode(input, { mode: 'decode', uppercase: false });
    expect(result).toBe('你好，世界！');
  });

  it('should encode a Russian string to lowercase hex correctly', () => {
    const input = 'Привет, мир!';
    const result = unicode(input, { mode: 'encode', uppercase: false });
    expect(result).toBe(
      '\\u041f\\u0440\\u0438\\u0432\\u0435\\u0442\\u002c\\u0020\\u043c\\u0438\\u0440\\u0021'
    );
  });

  it('should encode a Russian string to uppercase hex correctly', () => {
    const input = 'Привет, мир!';
    const result = unicode(input, { mode: 'encode', uppercase: true });
    expect(result).toBe(
      '\\u041F\\u0440\\u0438\\u0432\\u0435\\u0442\\u002C\\u0020\\u043C\\u0438\\u0440\\u0021'
    );
  });

  it('should decode a Russian lowercase hex string correctly', () => {
    const input =
      '\\u041f\\u0440\\u0438\\u0432\\u0435\\u0442\\u002c\\u0020\\u043c\\u0438\\u0440\\u0021';
    const result = unicode(input, { mode: 'decode', uppercase: false });
    expect(result).toBe('Привет, мир!');
  });

  it('should decode a Russian uppercase hex string correctly', () => {
    const input =
      '\\u041F\\u0440\\u0438\\u0432\\u0435\\u0442\\u002C\\u0020\\u043C\\u0438\\u0440\\u0021';
    const result = unicode(input, { mode: 'decode', uppercase: false });
    expect(result).toBe('Привет, мир!');
  });

  it('should encode a Spanish string to lowercase hex correctly', () => {
    const input = '¡Hola, Mundo!';
    const result = unicode(input, { mode: 'encode', uppercase: false });
    expect(result).toBe(
      '\\u00a1\\u0048\\u006f\\u006c\\u0061\\u002c\\u0020\\u004d\\u0075\\u006e\\u0064\\u006f\\u0021'
    );
  });

  it('should encode a Spanish string to uppercase hex correctly', () => {
    const input = '¡Hola, Mundo!';
    const result = unicode(input, { mode: 'encode', uppercase: true });
    expect(result).toBe(
      '\\u00A1\\u0048\\u006F\\u006C\\u0061\\u002C\\u0020\\u004D\\u0075\\u006E\\u0064\\u006F\\u0021'
    );
  });

  it('should decode a Spanish lowercase hex string correctly', () => {
    const input =
      '\\u00a1\\u0048\\u006f\\u006c\\u0061\\u002c\\u0020\\u004d\\u0075\\u006e\\u0064\\u006f\\u0021';
    const result = unicode(input, { mode: 'decode', uppercase: false });
    expect(result).toBe('¡Hola, Mundo!');
  });

  it('should decode a Spanish uppercase hex string correctly', () => {
    const input =
      '\\u00A1\\u0048\\u006F\\u006C\\u0061\\u002C\\u0020\\u004D\\u0075\\u006E\\u0064\\u006F\\u0021';
    const result = unicode(input, { mode: 'decode', uppercase: false });
    expect(result).toBe('¡Hola, Mundo!');
  });
});
