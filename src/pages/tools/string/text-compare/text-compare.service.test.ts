import { describe, it, expect } from 'vitest';
import { compareTextsHtml } from './service';

describe('compareTextsHtml', () => {
  it('should highlight added text', () => {
    const result = compareTextsHtml('Hello world', 'Hello world here', 'word');
    expect(result).toContain('<span class="diff-added"> here</span>');
  });

  it('should highlight removed text', () => {
    const result = compareTextsHtml('Hello world here', 'Hello world', 'word');
    expect(result).toContain('<span class="diff-removed"> here</span>');
  });

  it('should highlight changes in the middle of a sentence', () => {
    const result = compareTextsHtml(
      'I am in Lyon',
      'I am in Marseille',
      'word'
    );
    expect(result).toContain('I am in ');
    expect(result).toContain('<span class="diff-removed">Lyon</span>');
    expect(result).toContain('<span class="diff-added">Marseille</span>');
  });

  it('should return plain text for identical inputs', () => {
    const result = compareTextsHtml(
      'Same text everywhere',
      'Same text everywhere',
      'word'
    );
    expect(result).toContain('Same text everywhere');
    expect(result).not.toContain('diff-added');
    expect(result).not.toContain('diff-removed');
  });

  it('should escape HTML characters', () => {
    const result = compareTextsHtml(
      '<b>Hello</b>',
      '<b>Hello world</b>',
      'word'
    );
    expect(result).toContain('&lt;b&gt;Hello');
    expect(result).toContain('<span class="diff-added"> world</span>');
  });

  it('should escape & character', () => {
    const result = compareTextsHtml('AT&T', 'AT&T rocks', 'word');
    expect(result).toContain('AT&amp;T');
  });

  it('should wrap result in a diff-line div', () => {
    const result = compareTextsHtml('foo', 'bar', 'word');
    expect(result.startsWith('<div class="diff-line">')).toBe(true);
    expect(result.endsWith('</div>')).toBe(true);
  });

  it('should handle empty input strings', () => {
    const result = compareTextsHtml('', '', 'word');
    expect(result).toBe('<div class="diff-line"></div>');
  });

  it('should handle only added input', () => {
    const result = compareTextsHtml('', 'New text', 'word');
    expect(result).toContain('<span class="diff-added">New text</span>');
  });

  it('should handle only removed input', () => {
    const result = compareTextsHtml('Old text', '', 'word');
    expect(result).toContain('<span class="diff-removed">Old text</span>');
  });

  it('should convert newlines to <br>', () => {
    const result = compareTextsHtml('line1\nline2', 'line1\nline2', 'word');
    expect(result).toContain('<br>');
  });

  it('should highlight individual characters with char level', () => {
    const result = compareTextsHtml('color', 'colour', 'char');
    expect(result).toContain('<span class="diff-added">u</span>');
  });
});
