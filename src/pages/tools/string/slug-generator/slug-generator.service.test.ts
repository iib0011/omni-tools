import { expect, describe, it } from 'vitest';
import { main } from './service';

describe('slug-generator', () => {
  it('should convert to lowercase', () => {
    expect(main('Hello World', {})).toBe('hello-world');
  });

  it('should replace spaces with dashes', () => {
    expect(main('hello world', {})).toBe('hello-world');
  });

  it('should remove special characters', () => {
    expect(main('hello world!', {})).toBe('hello-world');
  });

  it('should handle multiple spaces and dashes', () => {
    expect(main('hello  world--test', {})).toBe('hello-world-test');
  });

  it('should trim dashes from ends', () => {
    expect(main('  hello world  ', {})).toBe('hello-world');
  });

  it('should handle non-alphanumeric characters', () => {
    expect(main('Hello World @2023!', {})).toBe('hello-world-2023');
  });
});
