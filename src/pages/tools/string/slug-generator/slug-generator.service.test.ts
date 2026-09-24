import { expect, describe, it } from 'vitest';
import { slugGenerator } from './service';

describe('slug-generator', () => {
  const defaultOptions = { caseSensitive: false };
  const caseSensitiveOptions = { caseSensitive: true };

  // Basic conversion
  it('should convert to lowercase', () => {
    expect(slugGenerator('Hello World', defaultOptions)).toBe('hello-world');
  });

  it('should preserve casing when caseSensitive is true', () => {
    expect(slugGenerator('Hello World', caseSensitiveOptions)).toBe(
      'Hello-World'
    );
  });

  // Spaces and dashes
  it('should replace spaces with dashes', () => {
    expect(slugGenerator('hello world', defaultOptions)).toBe('hello-world');
  });

  it('should handle multiple spaces and dashes', () => {
    expect(slugGenerator('hello  world--test', defaultOptions)).toBe(
      'hello-world-test'
    );
  });

  it('should trim dashes from ends', () => {
    expect(slugGenerator('  hello world  ', defaultOptions)).toBe(
      'hello-world'
    );
  });

  // Special characters
  it('should remove special characters', () => {
    expect(slugGenerator('hello world!', defaultOptions)).toBe('hello-world');
  });

  it('should handle non-alphanumeric characters', () => {
    expect(slugGenerator('Hello World @2023!', defaultOptions)).toBe(
      'hello-world-2023'
    );
  });

  // Accents
  it('should normalize accented characters', () => {
    expect(slugGenerator('Héllo Wörld', defaultOptions)).toBe('hello-world');
  });

  it('should normalize accents while preserving case when caseSensitive is true', () => {
    expect(slugGenerator('Héllo Wörld', caseSensitiveOptions)).toBe(
      'Hello-World'
    );
  });

  // Multi-line
  it('should handle multiple lines', () => {
    expect(slugGenerator('Hello World\nFoo Bar', defaultOptions)).toBe(
      'hello-world\nfoo-bar'
    );
  });

  it('should preserve empty lines', () => {
    expect(slugGenerator('Hello World\n\nFoo Bar', defaultOptions)).toBe(
      'hello-world\n\nfoo-bar'
    );
  });
});
