import { expect, type Page } from '@playwright/test';
import Jimp from 'jimp';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export const PDF_WORKBENCH_ORIGIN = 'http://localhost:4173';

export interface PdfFixtureOptions {
  author?: string;
  pageSize?: [number, number];
  title?: string;
}

export async function createPdfFixture(
  pageTexts: string[],
  {
    author = 'OmniTools Playwright',
    pageSize = [612, 792],
    title = 'PDF workbench fixture'
  }: PdfFixtureOptions = {}
): Promise<Buffer> {
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);
  const boldFont = await document.embedFont(StandardFonts.HelveticaBold);
  const fixedDate = new Date('2024-01-02T03:04:05.000Z');

  document.setTitle(title);
  document.setAuthor(author);
  document.setCreator('OmniTools deterministic E2E fixture');
  document.setProducer('pdf-lib');
  document.setCreationDate(fixedDate);
  document.setModificationDate(fixedDate);

  pageTexts.forEach((text, index) => {
    const page = document.addPage(pageSize);
    page.drawRectangle({
      x: 36,
      y: pageSize[1] - 104,
      width: pageSize[0] - 72,
      height: 68,
      color: rgb(0.95, 0.97, 1)
    });
    page.drawText(`PAGE ${index + 1}`, {
      x: 52,
      y: pageSize[1] - 82,
      size: 30,
      font: boldFont,
      color: rgb(0.03, 0.12, 0.3)
    });
    page.drawText(text, {
      x: 52,
      y: pageSize[1] - 176,
      size: 24,
      font,
      color: rgb(0, 0, 0),
      maxWidth: pageSize[0] - 104,
      lineHeight: 32
    });
  });

  return Buffer.from(
    await document.save({
      addDefaultPage: false,
      updateFieldAppearances: false,
      useObjectStreams: false
    })
  );
}

export async function createImageOnlyOcrPdfFixture(): Promise<Buffer> {
  const image = new Jimp(1200, 800, 0xffffffff);
  const font = await Jimp.loadFont(Jimp.FONT_SANS_128_BLACK);
  image.print(font, 72, 160, 'OMNI OCR', 1056);
  image.print(font, 72, 360, 'CODE 31415', 1056);
  const png = await image.getBufferAsync(Jimp.MIME_PNG);

  const document = await PDFDocument.create();
  const embeddedImage = await document.embedPng(png);
  const page = document.addPage([600, 400]);
  page.drawImage(embeddedImage, {
    x: 0,
    y: 0,
    width: 600,
    height: 400
  });
  const fixedDate = new Date('2024-01-02T03:04:05.000Z');
  document.setTitle('Image-only OCR fixture');
  document.setAuthor('OmniTools Playwright');
  document.setCreationDate(fixedDate);
  document.setModificationDate(fixedDate);

  return Buffer.from(
    await document.save({
      addDefaultPage: false,
      updateFieldAppearances: false,
      useObjectStreams: false
    })
  );
}

export async function extractPdfText(bytes: Uint8Array): Promise<string> {
  const pdfJs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const loadingTask = pdfJs.getDocument({
    data: Uint8Array.from(bytes),
    isEvalSupported: false,
    useWorkerFetch: false
  });
  const document = await loadingTask.promise;
  try {
    const pageTexts: string[] = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      pageTexts.push(
        content.items.map((item) => ('str' in item ? item.str : '')).join(' ')
      );
      page.cleanup();
    }
    return pageTexts.join('\n');
  } finally {
    await document.destroy();
  }
}

export async function preparePdfWorkbenchPage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem('i18nextLng', 'en');
    localStorage.setItem('lang', 'en');
    Object.defineProperty(window, 'showSaveFilePicker', {
      configurable: true,
      value: undefined
    });
  });
}

interface RecordedResponse {
  contentType: string;
  status: number;
  url: string;
}

export interface PdfNetworkAudit {
  assertJavaScriptMime: (pathPattern: RegExp) => void;
  assertNoExternalRequests: () => void;
}

export function installPdfNetworkAudit(
  page: Page,
  routeName: string
): PdfNetworkAudit {
  const externalRequests: string[] = [];
  const responses: RecordedResponse[] = [];

  page.context().on('request', (request) => {
    const url = new URL(request.url());
    if (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      url.origin !== PDF_WORKBENCH_ORIGIN
    ) {
      externalRequests.push(request.url());
    }
  });
  page.context().on('response', (response) => {
    responses.push({
      contentType: response.headers()['content-type'] ?? '',
      status: response.status(),
      url: response.url()
    });
  });

  const matchingResponses = (pathPattern: RegExp) =>
    responses.filter(({ url }) => pathPattern.test(new URL(url).pathname));

  return {
    assertJavaScriptMime: (pathPattern) => {
      const matches = matchingResponses(pathPattern);
      expect(
        matches,
        `${routeName} should load a matching worker script`
      ).not.toHaveLength(0);
      for (const response of matches) {
        expect(response.status, response.url).toBe(200);
        expect(response.contentType, response.url).toMatch(
          /(?:text|application)\/javascript/i
        );
      }
    },
    assertNoExternalRequests: () => {
      expect(
        externalRequests,
        `${routeName} made an external HTTP request`
      ).toEqual([]);
    }
  };
}
