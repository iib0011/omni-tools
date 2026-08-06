import { describe, expect, it } from 'vitest';
import {
  analyzeMarkdownComplexity,
  normalizeMarkdownInput,
  splitMarkdownIntoChunks
} from './service';

describe('markdown-to-pdf service helpers', () => {
  it('normalizes windows line endings and byte order marks', () => {
    expect(normalizeMarkdownInput('\uFEFF# Title\r\nLine')).toBe(
      '# Title\nLine'
    );
  });

  it('flags large markdown documents for manual regeneration', () => {
    const markdown = `${'# Report\n\n'}${'content line repeated for rendering\n'.repeat(
      4_000
    )}`;
    const analysis = analyzeMarkdownComplexity(markdown);

    expect(analysis.requiresManualGeneration).toBe(true);
    expect(analysis.exceedsSupportedSize).toBe(false);
  });

  it('rejects markdown documents that exceed safe browser limits', () => {
    const markdown = 'x'.repeat(500_001);
    const analysis = analyzeMarkdownComplexity(markdown);

    expect(analysis.exceedsSupportedSize).toBe(true);
  });

  it('splits large markdown documents without breaking fenced code blocks', () => {
    const markdown = [
      '# Section 1',
      '',
      'intro '.repeat(4_000),
      '',
      '```ts',
      'const value = 1;',
      'console.log(value);',
      '```',
      '',
      '# Section 2',
      '',
      'details '.repeat(4_000)
    ].join('\n');

    const chunks = splitMarkdownIntoChunks(markdown, 8_000, 3_000);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.join('\n')).toContain('```ts');
    expect(chunks.join('\n')).toContain('# Section 2');
  });
});
