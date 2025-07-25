import { describe, it, expect } from 'vitest';
import { compareTextsHtml } from './service';

describe('compareTextsHtml', () => {
  it('should highlight added text', () => {
    const textA = 'Bonjour tout le monde';
    const textB = 'Bonjour tout le monde ici';

    const result = compareTextsHtml(textA, textB);
    expect(result).toContain('<span class="diff-added">&nbsp;ici</span>');
  });

  it('should highlight removed text', () => {
    const textA = 'Bonjour tout le monde ici';
    const textB = 'Bonjour tout le monde';

    const result = compareTextsHtml(textA, textB);
    expect(result).toContain('<span class="diff-removed">&nbsp;ici</span>');
  });

  it('should highlight changes in the middle of a sentence', () => {
    const textA = 'Je suis à Lyon';
    const textB = 'Je suis à Marseille';

    const result = compareTextsHtml(textA, textB);
    expect(result).toContain('Je&nbsp;suis&nbsp;à&nbsp;');
    expect(result).toContain('<span class="diff-removed">Lyon</span>');
    expect(result).toContain('<span class="diff-added">Marseille</span>');
  });

  it('should return empty diff if texts are identical', () => {
    const input = 'Même texte partout';
    const result = compareTextsHtml(input, input);
    expect(result).toContain('<span>Même&nbsp;texte&nbsp;partout</span>');
    expect(result).not.toContain('diff-added');
    expect(result).not.toContain('diff-removed');
  });

  it('should handle HTML escaping', () => {
    const textA = '<b>Hello</b>';
    const textB = '<b>Hello world</b>';

    const result = compareTextsHtml(textA, textB);
    expect(result).toContain('&lt;b&gt;Hello');
    expect(result).toContain('<span class="diff-added">&nbsp;world</span>');
  });

  it('should return a single div with class diff-line', () => {
    const result = compareTextsHtml('foo', 'bar');
    expect(result.startsWith('<div class="diff-line">')).toBe(true);
    expect(result.endsWith('</div>')).toBe(true);
  });

  it('should handle empty strings', () => {
    const result = compareTextsHtml('', '');
    expect(result).toBe('<div class="diff-line"></div>');
  });

  it('should handle only added content', () => {
    const result = compareTextsHtml('', 'Nouveau texte');
    expect(result).toContain(
      '<span class="diff-added">Nouveau&nbsp;texte</span>'
    );
  });

  it('should handle only removed content', () => {
    const result = compareTextsHtml('Ancien texte', '');
    expect(result).toContain(
      '<span class="diff-removed">Ancien&nbsp;texte</span>'
    );
  });
});
