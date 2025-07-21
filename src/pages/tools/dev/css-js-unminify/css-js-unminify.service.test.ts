import { describe, it, expect } from 'vitest';
import { unminifyCss, unminifyJs } from './service';

describe('unminifyCss', () => {
  it('should format basic CSS block', () => {
    const input = `body{margin:0;padding:0}`;
    const result = unminifyCss(input);
    expect(result).toContain('body {');
    expect(result).toContain('margin: 0');
    expect(result).toContain('padding: 0');
  });

  it('should handle nested media queries', () => {
    const input = `@media screen and (max-width:600px){body{color:red}}`;
    const result = unminifyCss(input);
    expect(result).toContain('@media screen and (max-width:600px) {');
    expect(result).toContain('color: red');
  });

  it('should return empty string on empty input', () => {
    expect(unminifyCss('')).toBe('');
  });
});

describe('unminifyJs', () => {
  it('should format function block', () => {
    const input = `function test(){console.log("x")}`;
    const result = unminifyJs(input);
    expect(result).toContain('function test() {');
    expect(result).toContain('console.log("x")');
  });

  it('should insert newlines at semicolons and braces', () => {
    const input = `const x=1;const y=2;`;
    const result = unminifyJs(input);
    expect(result).toMatch(/const x = 1;\nconst y = 2;/);
  });

  it('should return empty string on empty input', () => {
    expect(unminifyJs('')).toBe('');
  });
});
