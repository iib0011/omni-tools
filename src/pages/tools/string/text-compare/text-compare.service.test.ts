import { describe, it, expect } from 'vitest';
import { compareTextsHtml } from './service';

describe('compareTextsHtml', () => {
  it('should highlight added text', () => {
    const textA = 'Hello world';
    const textB = 'Hello world here';

    const result = compareTextsHtml(textA, textB);
    expect(result).toContain('<span class="diff-added">&nbsp;here</span>');
  });

  it('should highlight removed text', () => {
    const textA = 'Hello world here';
    const textB = 'Hello world';

    const result = compareTextsHtml(textA, textB);
    expect(result).toContain('<span class="diff-removed">&nbsp;here</span>');
  });

  it('should highlight changes in the middle of a sentence', () => {
    const textA = 'I am in Lyon';
    const textB = 'I am in Marseille';

    const result = compareTextsHtml(textA, textB);
    expect(result).toContain('I&nbsp;am&nbsp;in&nbsp;');
    expect(result).toContain('<span class="diff-removed">Lyon</span>');
    expect(result).toContain('<span class="diff-added">Marseille</span>');
  });

  it('should return plain diff if texts are identical', () => {
    const input = 'Same text everywhere';
    const result = compareTextsHtml(input, input);
    expect(result).toContain('<span>Same&nbsp;text&nbsp;everywhere</span>');
    expect(result).not.toContain('diff-added');
    expect(result).not.toContain('diff-removed');
  });

  it('should escape HTML characters', () => {
    const textA = '<b>Hello</b>';
    const textB = '<b>Hello world</b>';

    const result = compareTextsHtml(textA, textB);
    expect(result).toContain('&lt;b&gt;Hello');
    expect(result).toContain('<span class="diff-added">&nbsp;world</span>');
  });

  it('should wrap result in a single diff-line div', () => {
    const result = compareTextsHtml('foo', 'bar');
    expect(result.startsWith('<div class="diff-line">')).toBe(true);
    expect(result.endsWith('</div>')).toBe(true);
  });

  it('should handle empty input strings', () => {
    const result = compareTextsHtml('', '');
    expect(result).toBe('<div class="diff-line"></div>');
  });

  it('should handle only added input', () => {
    const result = compareTextsHtml('', 'New text');
    expect(result).toContain('<span class="diff-added">New&nbsp;text</span>');
  });

  it('should handle only removed input', () => {
    const result = compareTextsHtml('Old text', '');
    expect(result).toContain('<span class="diff-removed">Old&nbsp;text</span>');
  });
});
