import { describe, it, expect } from 'vitest';
import { minifyCss, minifyJs } from './service';

describe('minifyCss', () => {
  it('should remove comments and whitespace', () => {
    const input = `
      /* Comment */
      body {
        margin: 0;
        padding: 0;
      }
    `;
    const result = minifyCss(input);
    expect(result).toBe('body{margin:0;padding:0}');
  });

  it('should handle nested rules', () => {
    const input = `
      @media screen and (max-width: 600px) {
        body {
          background-color: red;
        }
      }
    `;
    const result = minifyCss(input);
    expect(result).toBe(
      '@media screen and (max-width:600px){body{background-color:red}}'
    );
  });

  it('should remove semicolon before closing brace', () => {
    const input = `h1 { color: blue; }`;
    const result = minifyCss(input);
    expect(result).toBe('h1{color:blue}');
  });

  it('should return empty string for empty input', () => {
    expect(minifyCss('')).toBe('');
  });
});

describe('minifyJs', () => {
  it('should remove line and block comments', () => {
    const input = `
// This is a comment
/* Another comment */
function test() {
  console.log("Hello");
}
    `;
    const result = minifyJs(input);
    expect(result).toBe('function test(){console.log("Hello")}');
  });

  it('should remove unnecessary spaces and semicolons', () => {
    const input = `
      const x = 1 ;
      const y = 2 ;
      console.log( x + y );
    `;
    const result = minifyJs(input);
    expect(result).toBe('const x=1;const y=2;console.log(x+y);');
  });

  it('should handle multi-line function with logic', () => {
    const input = `
      function sum(a, b) {
        return a + b;
      }
    `;
    const result = minifyJs(input);
    expect(result).toBe('function sum(a,b){return a+b}');
  });

  it('should return empty string for empty input', () => {
    expect(minifyJs('')).toBe('');
  });

  it('should not crash on malformed JS', () => {
    const input = `function {`;
    const result = minifyJs(input);
    expect(typeof result).toBe('string'); // still returns a string
  });
});
