import { describe, expect, it } from 'vitest';
import { buildMarkdownPdfHtml } from './html';

describe('markdown-to-pdf html generation', () => {
  it('builds a semantic HTML document with metadata and source details', () => {
    const { html, title, outputBaseName } = buildMarkdownPdfHtml(
      '# Audit Report\n\nA paragraph with **bold** text.\n',
      {
        pageFormat: 'a4',
        orientation: 'portrait',
        fontScale: 100,
        sourceName: 'report.md'
      }
    );

    expect(title).toBe('Audit Report');
    expect(outputBaseName).toBe('audit-report');
    expect(html).toContain('<article class="markdown-body">');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('Source: report.md');
    expect(html).toContain('@page {');
  });

  it('renders fenced code blocks with syntax highlighting markup', () => {
    const { html } = buildMarkdownPdfHtml('```ts\nconst total = 2 + 3;\n```', {
      pageFormat: 'letter',
      orientation: 'landscape',
      fontScale: 110
    });

    expect(html).toContain('class="code-block"');
    expect(html).toContain('class="hljs language-ts"');
    expect(html).toContain('const');
  });

  it('renders inline links without crashing the marked renderer', () => {
    const { html } = buildMarkdownPdfHtml(
      'Visit [OmniTools](https://omnitools.app) for details.',
      {
        pageFormat: 'a4',
        orientation: 'portrait',
        fontScale: 100
      }
    );

    expect(html).toContain('href="https://omnitools.app"');
    expect(html).toContain('>OmniTools</a>');
  });
});
