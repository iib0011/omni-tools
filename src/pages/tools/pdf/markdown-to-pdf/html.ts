import hljs from 'highlight.js';
import { Marked, Renderer } from 'marked';
import {
  extractDocumentTitle,
  getMarkdownPdfBaseName,
  normalizeMarkdownInput
} from './analysis';
import { getMarkdownPdfPrintCss } from './printCss';
import { MarkdownPdfRenderOptions } from './types';

function escapeHtml(value: string): string {
  return value
    .replace(/&/gu, '&amp;')
    .replace(/</gu, '&lt;')
    .replace(/>/gu, '&gt;')
    .replace(/"/gu, '&quot;')
    .replace(/'/gu, '&#39;');
}

function sanitizeHref(value: string | null | undefined): string {
  if (!value) {
    return '#';
  }

  const trimmed = value.trim();
  if (/^(https?:|mailto:|tel:|data:image\/|\/|\.{1,2}\/|#)/iu.test(trimmed)) {
    return trimmed;
  }

  return '#';
}

function sanitizeImageSource(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  const trimmed = value.trim();
  if (/^(https?:|data:image\/|\/|\.{1,2}\/)/iu.test(trimmed)) {
    return trimmed;
  }

  return '';
}

function highlightCode(
  code: string,
  language?: string
): { html: string; languageLabel: string } {
  const normalizedLanguage = language?.trim().toLowerCase();

  if (normalizedLanguage && hljs.getLanguage(normalizedLanguage)) {
    return {
      html: hljs.highlight(code, {
        language: normalizedLanguage,
        ignoreIllegals: true
      }).value,
      languageLabel: normalizedLanguage
    };
  }

  return {
    html: hljs.highlightAuto(code).value,
    languageLabel: normalizedLanguage || 'plain text'
  };
}

function createMarkedRenderer(): Marked {
  const renderer = new Renderer();

  renderer.html = () => '';
  renderer.code = ({ text, lang }) => {
    const { html, languageLabel } = highlightCode(text, lang);

    return `
      <div class="code-block">
        <div class="code-language">${escapeHtml(languageLabel)}</div>
        <pre><code class="hljs language-${escapeHtml(
          (lang || 'plaintext').toLowerCase()
        )}">${html}</code></pre>
      </div>
    `;
  };
  renderer.link = function ({ href, title, tokens }) {
    const label = tokens
      ? this.parser.parseInline(tokens)
      : escapeHtml(href || '');
    const safeHref = escapeHtml(sanitizeHref(href));
    const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';

    return `<a href="${safeHref}"${titleAttr} target="_blank" rel="noreferrer noopener">${label}</a>`;
  };
  renderer.image = ({ href, title, text }) => {
    const safeHref = sanitizeImageSource(href);

    if (!safeHref) {
      return title || text
        ? `<p><em>${escapeHtml(title || text)}</em></p>`
        : '';
    }

    const alt = escapeHtml(text || '');
    const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
    const figureCaption = title
      ? `<figcaption>${escapeHtml(title)}</figcaption>`
      : '';

    return `<figure><img src="${escapeHtml(
      safeHref
    )}" alt="${alt}"${titleAttr} />${figureCaption}</figure>`;
  };

  return new Marked({
    gfm: true,
    breaks: false,
    renderer
  });
}

export function buildMarkdownPdfHtml(
  markdown: string,
  options: MarkdownPdfRenderOptions
): {
  html: string;
  title: string;
  outputBaseName: string;
} {
  const normalized = normalizeMarkdownInput(markdown).trim();
  const documentTitle =
    extractDocumentTitle(normalized) ||
    options.sourceName?.replace(/\.[^.]+$/u, '') ||
    'Markdown Document';
  const outputBaseName = getMarkdownPdfBaseName(options.sourceName, normalized);
  const markedInstance = createMarkedRenderer();
  const bodyHtml = markedInstance.parse(normalized) as string;
  const css = getMarkdownPdfPrintCss(options);
  const sourceMarkup = options.sourceName
    ? `<p class="document-source">Source: ${escapeHtml(options.sourceName)}</p>`
    : '';

  return {
    title: documentTitle,
    outputBaseName,
    html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>${escapeHtml(documentTitle)}</title>
    <style>${css}</style>
  </head>
  <body>
    <main class="document-shell">
      <header class="document-header">
        <h1 class="document-title">${escapeHtml(documentTitle)}</h1>
        ${sourceMarkup}
      </header>
      <article class="markdown-body">
        ${bodyHtml}
      </article>
    </main>
  </body>
</html>`
  };
}

export { getMarkdownPdfBaseName };
