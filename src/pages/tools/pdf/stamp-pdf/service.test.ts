import { describe, expect, it } from 'vitest';
import { degrees, PDFDocument } from 'pdf-lib';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { stampPdf } from './service';
import type { StampOptions } from './types';

const defaults: StampOptions = {
  mode: 'page-numbers',
  pageRange: '',
  layer: 'above',
  position: 'bottom-center',
  horizontalMargin: 24,
  verticalMargin: 24,
  opacity: 1,
  rotation: 0,
  fontSize: 12,
  color: '#000000',
  text: 'DRAFT',
  pageNumberFormat: 'Page {current} of {total}',
  startingPageNumber: 1,
  batesPrefix: '',
  batesSuffix: '',
  batesStart: 1,
  batesPadding: 6,
  headerText: '',
  footerText: '',
  imageScale: 25,
  preserveAspectRatio: true
};

async function fixture(): Promise<ArrayBuffer> {
  const pdf = await PDFDocument.create();
  pdf.addPage([300, 400]);
  pdf.addPage([500, 600]);
  pdf.addPage([300, 400]);
  const bytes = await pdf.save();
  return Uint8Array.from(bytes).buffer;
}

async function extractText(bytes: ArrayBuffer): Promise<string[]> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(
    resolve(
      process.cwd(),
      'node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs'
    )
  ).href;
  const document = await pdfjs.getDocument({
    data: new Uint8Array(bytes.slice(0)),
    isEvalSupported: false,
    useWorkerFetch: false
  }).promise;
  try {
    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const content = await (
        await document.getPage(pageNumber)
      ).getTextContent();
      pages.push(
        content.items.map((item) => ('str' in item ? item.str : '')).join(' ')
      );
    }
    return pages;
  } finally {
    await document.destroy();
  }
}

describe('stamp PDF service', () => {
  it('preserves page count and respects a page range', async () => {
    const result = await stampPdf(
      { pdfBytes: await fixture(), options: { ...defaults, pageRange: '2' } },
      () => undefined,
      () => false
    );
    const output = await PDFDocument.load(result.bytes);
    expect(output.getPageCount()).toBe(3);
    expect(result.stampedPages).toEqual([2]);
    expect(output.getPage(1).getSize()).toEqual({ width: 500, height: 600 });
    const text = await extractText(result.bytes);
    expect(text[0]).toBe('');
    expect(text[1]).toContain('Page 2 of 3');
    expect(text[2]).toBe('');
  });

  it('creates Bates text without changing page count', async () => {
    const result = await stampPdf(
      {
        pdfBytes: await fixture(),
        options: {
          ...defaults,
          mode: 'bates',
          batesPrefix: 'CASE-',
          batesStart: 10,
          batesPadding: 4
        }
      },
      () => undefined,
      () => false
    );
    expect((await PDFDocument.load(result.bytes)).getPageCount()).toBe(3);
    expect(result.stampedPages).toEqual([1, 2, 3]);
  });

  it('stops before processing further pages after cancellation', async () => {
    let progress = 0;
    await expect(
      stampPdf(
        { pdfBytes: await fixture(), options: defaults },
        () => {
          progress += 1;
        },
        () => progress === 1
      )
    ).rejects.toMatchObject({ code: 'cancelled' });
    expect(progress).toBe(1);
  });

  it('embeds an image watermark and produces a reopenable PDF', async () => {
    const imageBytes = Uint8Array.from(
      atob(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL4WQAAAABJRU5ErkJggg=='
      ),
      (character) => character.charCodeAt(0)
    ).buffer;
    const result = await stampPdf(
      {
        pdfBytes: await fixture(),
        imageBytes,
        imageType: 'image/png',
        options: { ...defaults, mode: 'image', pageRange: '1,3' }
      },
      () => undefined,
      () => false
    );
    expect((await PDFDocument.load(result.bytes)).getPageCount()).toBe(3);
    expect(result.stampedPages).toEqual([1, 3]);
  });

  it('places horizontal text at the visual top-left of a rotated page', async () => {
    const source = await PDFDocument.create();
    const page = source.addPage([612, 792]);
    page.setRotation(degrees(90));
    const sourceBytes = Uint8Array.from(await source.save()).buffer;
    const result = await stampPdf(
      {
        pdfBytes: sourceBytes,
        options: {
          ...defaults,
          mode: 'text',
          text: 'ROTATED',
          position: 'top-left',
          horizontalMargin: 24,
          verticalMargin: 24,
          rotation: 0
        }
      },
      () => undefined,
      () => false
    );

    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(
      resolve(
        process.cwd(),
        'node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs'
      )
    ).href;
    const document = await pdfjs.getDocument({
      data: new Uint8Array(result.bytes.slice(0)),
      isEvalSupported: false,
      useWorkerFetch: false
    }).promise;
    try {
      const outputPage = await document.getPage(1);
      const viewport = outputPage.getViewport({ scale: 1 });
      const content = await outputPage.getTextContent();
      const item = content.items.find(
        (candidate) => 'str' in candidate && candidate.str === 'ROTATED'
      );
      expect(item && 'transform' in item).toBe(true);
      if (!item || !('transform' in item)) return;
      const [a, b, , , e, f] = item.transform;
      const [va, vb, vc, vd, ve, vf] = viewport.transform;
      const visualX = va * e + vc * f + ve;
      const visualY = vb * e + vd * f + vf;
      const baselineX = va * a + vc * b;
      const baselineY = vb * a + vd * b;

      expect(outputPage.rotate).toBe(90);
      expect(visualX).toBeCloseTo(24, 0);
      expect(visualY).toBeLessThan(60);
      expect(baselineX).toBeGreaterThan(0);
      expect(Math.abs(baselineY)).toBeLessThan(0.01);
    } finally {
      await document.destroy();
    }
  });
});
