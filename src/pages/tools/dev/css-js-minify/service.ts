import { containsOnlyDigits } from '@utils/string';

export function minifyCss(input: string): string {
  try {
    return input
      .replace(/\/\*[\s\S]*?\*\//g, '') // remove comments
      .replace(/\s*([{}:;,])\s*/g, '$1') // remove spaces around tokens
      .replace(/\s+/g, ' ') // collapse whitespace
      .replace(/;}/g, '}') // remove unnecessary semicolons
      .trim();
  } catch {
    return '/* CSS minification error */';
  }
}

export function minifyJs(input: string): string {
  try {
    return input
      .replace(/\/\/[^\n]*/g, '') // remove line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // remove block comments
      .replace(/\s*([=+\-*/{}();,:<>|&!])\s*/g, '$1') // remove spaces around operators
      .replace(/\s+/g, ' ') // collapse spaces
      .replace(/;\s*}/g, '}') // remove semicolon before }
      .trim();
  } catch {
    return '// JavaScript minification error';
  }
}
