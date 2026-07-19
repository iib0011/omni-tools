import {
  analyzeMarkdownComplexity,
  extractDocumentTitle,
  getMarkdownPdfBaseName,
  normalizeMarkdownInput,
  splitMarkdownIntoChunks
} from './analysis';
import { MarkdownPdfRenderOptions } from './types';

export {
  analyzeMarkdownComplexity,
  extractDocumentTitle,
  getMarkdownPdfBaseName,
  normalizeMarkdownInput,
  splitMarkdownIntoChunks
};

export async function generateMarkdownPdf(
  markdown: string,
  options: MarkdownPdfRenderOptions
): Promise<File> {
  const normalized = normalizeMarkdownInput(markdown).trim();
  if (!normalized) {
    throw new Error('Markdown input is empty');
  }

  const analysis = analyzeMarkdownComplexity(normalized);
  if (analysis.exceedsSupportedSize) {
    throw new Error('Markdown document is too large to render safely');
  }

  const response = await fetch('/api/pdf/markdown-to-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      markdown: normalized,
      options
    })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to render Markdown PDF');
  }

  const pdfBlob = await response.blob();
  const outputBaseName = getMarkdownPdfBaseName(options.sourceName, normalized);

  return new File([pdfBlob], `${outputBaseName}.pdf`, {
    type: 'application/pdf'
  });
}
