import { MarkdownPdfRenderOptions } from './types';

function resolvePageSize(
  pageFormat: MarkdownPdfRenderOptions['pageFormat'],
  orientation: MarkdownPdfRenderOptions['orientation']
): string {
  return `${pageFormat.toUpperCase()} ${orientation}`;
}

export function getMarkdownPdfPrintCss(
  options: MarkdownPdfRenderOptions
): string {
  const baseFontSize = 16 * (options.fontScale / 100);
  const codeFontSize = 13 * (options.fontScale / 100);
  const headingScale = options.fontScale / 100;

  return `
    @page {
      size: ${resolvePageSize(options.pageFormat, options.orientation)};
      margin: 20mm 15mm 20mm 15mm;
    }

    :root {
      color-scheme: light;
      --page-text: #172033;
      --page-muted: #5a657a;
      --page-border: #d4dae6;
      --page-border-strong: #bfc8d8;
      --page-surface: #ffffff;
      --page-surface-muted: #f6f8fb;
      --page-accent: #1f4b99;
      --page-code-bg: #0f172a;
      --page-code-text: #e2e8f0;
      --page-code-border: #1e293b;
      --page-quote-bg: #f8fafc;
      --page-quote-border: #94a3b8;
      --page-link: #1d4ed8;
      --font-sans: "Noto Sans", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
      --font-serif: "Noto Serif", Georgia, "Times New Roman", serif;
      --font-mono: "Noto Sans Mono", "Cascadia Code", "SFMono-Regular", Consolas, "Liberation Mono", monospace;
      --base-font-size: ${baseFontSize}px;
      --code-font-size: ${codeFontSize}px;
      --heading-scale: ${headingScale};
    }

    * {
      box-sizing: border-box;
    }

    html {
      font-size: var(--base-font-size);
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      margin: 0;
      color: var(--page-text);
      background: var(--page-surface);
      font-family: var(--font-sans);
      line-height: 1.68;
      text-rendering: optimizeLegibility;
      overflow-wrap: anywhere;
    }

    .document-shell {
      width: 100%;
    }

    .document-header {
      margin: 0 0 1.8rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--page-border);
    }

    .document-title {
      margin: 0;
      font-family: var(--font-serif);
      font-size: calc(2.2rem * var(--heading-scale));
      line-height: 1.15;
      letter-spacing: -0.02em;
    }

    .document-source {
      margin: 0.75rem 0 0;
      color: var(--page-muted);
      font-size: 0.95rem;
    }

    .markdown-body {
      min-width: 0;
    }

    .markdown-body > :first-child {
      margin-top: 0;
    }

    .markdown-body > :last-child {
      margin-bottom: 0;
    }

    h1, h2, h3, h4, h5, h6 {
      margin: 1.75em 0 0.55em;
      color: #0f172a;
      font-family: var(--font-serif);
      font-weight: 700;
      line-height: 1.2;
      page-break-after: avoid;
      break-after: avoid-page;
      break-inside: avoid-page;
    }

    h1 {
      font-size: calc(2rem * var(--heading-scale));
      padding-bottom: 0.35rem;
      border-bottom: 1px solid var(--page-border);
    }

    h2 {
      font-size: calc(1.6rem * var(--heading-scale));
    }

    h3 {
      font-size: calc(1.32rem * var(--heading-scale));
    }

    h4 {
      font-size: calc(1.12rem * var(--heading-scale));
    }

    h5, h6 {
      font-size: calc(1rem * var(--heading-scale));
    }

    p, ul, ol, dl, blockquote, table, pre, figure {
      margin: 0 0 1rem;
    }

    p, li {
      orphans: 3;
      widows: 3;
    }

    ul, ol {
      padding-left: 1.5rem;
    }

    li + li {
      margin-top: 0.35rem;
    }

    li > ul,
    li > ol {
      margin-top: 0.5rem;
      margin-bottom: 0;
    }

    a {
      color: var(--page-link);
      text-decoration: underline;
      text-underline-offset: 0.15em;
      overflow-wrap: anywhere;
    }

    strong {
      font-weight: 700;
    }

    em {
      font-style: italic;
    }

    hr {
      margin: 2rem 0;
      border: 0;
      border-top: 1px solid var(--page-border);
    }

    blockquote {
      padding: 0.85rem 1rem;
      border-left: 4px solid var(--page-quote-border);
      background: var(--page-quote-bg);
      color: #334155;
      break-inside: avoid-page;
    }

    code {
      font-family: var(--font-mono);
      font-size: 0.92em;
    }

    :not(pre) > code {
      padding: 0.12rem 0.35rem;
      border-radius: 0.3rem;
      background: var(--page-surface-muted);
      color: #0f172a;
      border: 1px solid var(--page-border);
    }

    pre {
      white-space: pre-wrap;
      overflow-wrap: break-word;
      word-break: break-word;
      page-break-inside: avoid;
      break-inside: avoid-page;
      overflow: visible;
      padding: 1rem 1.1rem;
      border-radius: 0.65rem;
      background: var(--page-code-bg);
      color: var(--page-code-text);
      border: 1px solid var(--page-code-border);
      font-family: var(--font-mono);
      font-size: var(--code-font-size);
      line-height: 1.55;
      tab-size: 2;
    }

    pre code {
      display: block;
      white-space: inherit;
      overflow-wrap: inherit;
      word-break: inherit;
      background: transparent;
      border: 0;
      padding: 0;
      color: inherit;
      font-size: inherit;
    }

    .code-block {
      position: relative;
    }

    .code-language {
      display: inline-block;
      margin-bottom: 0.55rem;
      color: #cbd5e1;
      font-family: var(--font-mono);
      font-size: 0.76rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      border: 1px solid var(--page-border-strong);
      font-size: 0.95rem;
    }

    thead {
      display: table-header-group;
    }

    tbody, tfoot {
      display: table-row-group;
    }

    tr {
      page-break-inside: avoid;
      break-inside: avoid-page;
    }

    th, td {
      padding: 0.65rem 0.75rem;
      text-align: left;
      vertical-align: top;
      border: 1px solid var(--page-border);
      overflow-wrap: anywhere;
      word-break: break-word;
    }

    th {
      background: var(--page-surface-muted);
      font-weight: 700;
      color: #0f172a;
    }

    img {
      display: block;
      max-width: 100%;
      height: auto;
      margin: 1rem auto;
      page-break-inside: avoid;
      break-inside: avoid-page;
    }

    figure {
      margin-left: 0;
      margin-right: 0;
      page-break-inside: avoid;
      break-inside: avoid-page;
    }

    figcaption {
      margin-top: 0.55rem;
      color: var(--page-muted);
      font-size: 0.88rem;
      text-align: center;
    }

    .task-list-item {
      list-style: none;
    }

    .task-list-item input {
      margin-right: 0.45rem;
    }

    .hljs-keyword,
    .hljs-selector-tag,
    .hljs-literal,
    .hljs-section,
    .hljs-link {
      color: #93c5fd;
    }

    .hljs-string,
    .hljs-title,
    .hljs-name,
    .hljs-type,
    .hljs-attribute,
    .hljs-symbol,
    .hljs-bullet,
    .hljs-addition,
    .hljs-template-tag,
    .hljs-template-variable {
      color: #86efac;
    }

    .hljs-comment,
    .hljs-quote,
    .hljs-deletion,
    .hljs-meta {
      color: #94a3b8;
    }

    .hljs-number,
    .hljs-regexp {
      color: #f9a8d4;
    }

    .hljs-built_in,
    .hljs-doctag,
    .hljs-variable,
    .hljs-title.class_,
    .hljs-title.class {
      color: #fcd34d;
    }
  `;
}
