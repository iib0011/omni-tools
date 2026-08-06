import { chromium } from 'playwright';
import { analyzeMarkdownComplexity } from '../../src/pages/tools/pdf/markdown-to-pdf/analysis';
import { buildMarkdownPdfHtml } from '../../src/pages/tools/pdf/markdown-to-pdf/html';
import { MarkdownPdfRenderOptions } from '../../src/pages/tools/pdf/markdown-to-pdf/types';

async function waitForImagesToSettle(
  page: import('playwright').Page
): Promise<void> {
  await page.evaluate(async () => {
    await Promise.all(
      Array.from(document.images)
        .filter((image) => !image.complete)
        .map(
          (image) =>
            new Promise<void>((resolve) => {
              image.addEventListener('load', () => resolve(), { once: true });
              image.addEventListener('error', () => resolve(), { once: true });
            })
        )
    );
  });
}

export async function renderMarkdownPdfBuffer(
  markdown: string,
  options: MarkdownPdfRenderOptions
): Promise<{
  buffer: Buffer;
  title: string;
  outputBaseName: string;
}> {
  const normalized = markdown.trim();
  if (!normalized) {
    throw new Error('Markdown input is empty');
  }

  const analysis = analyzeMarkdownComplexity(normalized);
  if (analysis.exceedsSupportedSize) {
    throw new Error('Markdown document is too large to render safely');
  }

  const { html, title, outputBaseName } = buildMarkdownPdfHtml(
    normalized,
    options
  );
  const browser = await chromium.launch({
    headless: true
  });

  try {
    const page = await browser.newPage({
      locale: 'en-US'
    });

    await page.setContent(html, {
      waitUntil: 'networkidle'
    });
    await page.evaluateHandle('document.fonts.ready');
    await waitForImagesToSettle(page);

    const pdf = await page.pdf({
      format: options.pageFormat,
      landscape: options.orientation === 'landscape',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });

    return {
      buffer: pdf,
      title,
      outputBaseName
    };
  } finally {
    await browser.close();
  }
}
