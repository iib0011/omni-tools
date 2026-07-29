import { describe, expect, it, vi } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  DEFAULT_OCR_OPTIONS,
  buildSearchablePdf,
  collectOcrLines,
  collectExpectedSearchableText,
  createJsonOutput,
  createTextOutput,
  hasMeaningfulNativeText,
  mapOcrBoxToPdfPlacement,
  processOcrPageSequence
} from './service';
import type { OcrJsonReport, OcrPageResult } from './types';

const page = (overrides: Partial<OcrPageResult> = {}): OcrPageResult => ({
  pageNumber: 1,
  status: 'ocr',
  width: 612,
  height: 792,
  rotation: 0,
  imageWidth: 1275,
  imageHeight: 1650,
  text: 'Known searchable text',
  lines: [],
  words: [],
  ...overrides
});

describe('OCR service helpers', () => {
  it('detects meaningful native text using non-space characters', () => {
    expect(hasMeaningfulNativeText('A meaningful native text layer', 10)).toBe(
      true
    );
    expect(hasMeaningfulNativeText('  tiny  ', 10)).toBe(false);
  });

  it('creates deterministic UTF-8 text and structured JSON output', () => {
    const pages = [
      page(),
      page({ pageNumber: 2, status: 'failed', text: '', error: 'Unreadable' })
    ];
    expect(createTextOutput(pages)).toContain('Known searchable text');
    expect(createTextOutput(pages)).toContain('Unreadable');
    const report: OcrJsonReport = {
      version: 1,
      source: { name: 'fixture.pdf', size: 10, pageCount: 2 },
      options: {
        pageRange: '',
        language: 'eng',
        dpi: 200,
        autoOrient: true,
        skipTextPages: true,
        meaningfulTextThreshold: 40
      },
      pages
    };
    expect(JSON.parse(createJsonOutput(report))).toEqual(report);
  });

  it('retains source PDF page dimensions in a generated fixture', async () => {
    const document = await PDFDocument.create();
    document.addPage([333, 444]);
    const reopened = await PDFDocument.load(await document.save());
    expect(reopened.getPage(0).getSize()).toEqual({ width: 333, height: 444 });
  });

  it('handles absent OCR layout blocks', () => {
    expect(collectOcrLines(null)).toEqual([]);
  });

  it('maps unrotated OCR boxes through the PDF.js viewport', () => {
    const placement = mapOcrBoxToPdfPlacement(
      { x0: 200, y0: 100, x1: 320, y1: 130 },
      {
        convertToPdfPoint: (x, y) => [x, 400 - y]
      },
      { width: 600, height: 400 },
      0
    );

    expect(placement.x).toBeCloseTo(200);
    expect(placement.y).toBeCloseTo(270);
    expect(placement.width).toBeCloseTo(120);
    expect(placement.height).toBeCloseTo(30);
    expect(placement.rotation).toBeCloseTo(0);
  });

  it.each([
    {
      angle: Math.PI / 2,
      expected: { x: 230, y: 100, width: 120, height: 30, rotation: 90 }
    },
    {
      angle: -Math.PI / 2,
      expected: { x: 370, y: 300, width: 120, height: 30, rotation: -90 }
    }
  ])(
    'inverts Tesseract auto-orientation angle $angle before PDF placement',
    ({ angle, expected }) => {
      const placement = mapOcrBoxToPdfPlacement(
        { x0: 200, y0: 100, x1: 320, y1: 130 },
        {
          convertToPdfPoint: (x, y) => [x, 400 - y]
        },
        { width: 600, height: 400 },
        angle
      );

      expect(placement.x).toBeCloseTo(expected.x);
      expect(placement.y).toBeCloseTo(expected.y);
      expect(placement.width).toBeCloseTo(expected.width);
      expect(placement.height).toBeCloseTo(expected.height);
      expect(placement.rotation).toBeCloseTo(expected.rotation);
    }
  );

  it('uses the default policy to skip native-text pages before OCR', async () => {
    const recognizePage = vi.fn(async (_page: number, pageNumber: number) => ({
      pageNumber,
      status: 'ocr'
    }));
    const cleanupPage = vi.fn();
    const results = await processOcrPageSequence({
      pageNumbers: [1, 2],
      options: DEFAULT_OCR_OPTIONS,
      signal: new AbortController().signal,
      loadPage: async (pageNumber) => pageNumber,
      readNativeText: async (pageNumber) =>
        pageNumber === 1
          ? 'This existing native text layer is meaningful and already searchable.'
          : '',
      createNativeResult: (_page, pageNumber) => ({
        pageNumber,
        status: 'native'
      }),
      recognizePage,
      createFailedResult: (_page, pageNumber) => ({
        pageNumber,
        status: 'failed'
      }),
      cleanupPage
    });

    expect(results).toEqual([
      { pageNumber: 1, status: 'native' },
      { pageNumber: 2, status: 'ocr' }
    ]);
    expect(recognizePage).toHaveBeenCalledTimes(1);
    expect(recognizePage.mock.calls[0]?.[1]).toBe(2);
    expect(cleanupPage).toHaveBeenCalledTimes(2);
  });

  it('does not begin another page after cancellation', async () => {
    const controller = new AbortController();
    const loadedPages: number[] = [];
    const recognizedPages: number[] = [];
    const cleanedPages: number[] = [];

    await expect(
      processOcrPageSequence({
        pageNumbers: [1, 2, 3],
        options: { ...DEFAULT_OCR_OPTIONS, skipTextPages: false },
        signal: controller.signal,
        loadPage: async (pageNumber) => {
          loadedPages.push(pageNumber);
          return pageNumber;
        },
        readNativeText: async () => '',
        createNativeResult: (_page, pageNumber) => pageNumber,
        recognizePage: async (_page, pageNumber) => {
          recognizedPages.push(pageNumber);
          controller.abort();
          return pageNumber;
        },
        createFailedResult: (_page, pageNumber) => pageNumber,
        cleanupPage: (_page, pageNumber) => {
          cleanedPages.push(pageNumber);
        }
      })
    ).rejects.toMatchObject({ code: 'cancelled' });

    expect(loadedPages).toEqual([1]);
    expect(recognizedPages).toEqual([1]);
    expect(cleanedPages).toEqual([1]);
  });

  it('requires verifiable searchable text from OCR or native pages', () => {
    expect(
      collectExpectedSearchableText([
        page({ status: 'failed', text: '', error: 'Unreadable' }),
        page({ pageNumber: 2, text: '', words: [] })
      ])
    ).toEqual([]);
    expect(
      collectExpectedSearchableText([
        page({
          status: 'native',
          text: 'Existing searchable native text',
          words: []
        })
      ])
    ).toEqual(['Existing searchable native text']);
  });

  it('builds a reopenable PDF whose OCR text is extracted by PDF.js', async () => {
    const source = await PDFDocument.create();
    source.addPage([300, 400]);
    const sourceBytes = Uint8Array.from(await source.save()).buffer;
    const fontBytes = Uint8Array.from(
      await readFile(
        resolve(
          process.cwd(),
          'public/pdf-workbench/fonts/NotoSans-Regular.ttf'
        )
      )
    ).buffer;
    const result = await buildSearchablePdf(
      {
        pdfBytes: sourceBytes,
        fontBytes,
        pages: [
          page({
            width: 300,
            height: 400,
            imageWidth: 600,
            imageHeight: 800,
            text: 'Known searchable text',
            words: [
              {
                text: 'Known',
                confidence: 99,
                bbox: { x0: 40, y0: 60, x1: 180, y1: 100 }
              },
              {
                text: 'searchable',
                confidence: 98,
                bbox: { x0: 190, y0: 60, x1: 410, y1: 100 }
              },
              {
                text: 'text',
                confidence: 97,
                bbox: { x0: 420, y0: 60, x1: 520, y1: 100 }
              }
            ]
          })
        ]
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
      expect(document.numPages).toBe(1);
      const viewport = (await document.getPage(1)).getViewport({ scale: 1 });
      expect(viewport.width).toBe(300);
      expect(viewport.height).toBe(400);
      const content = await (await document.getPage(1)).getTextContent();
      const text = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ');
      expect(text).toContain('Known');
      expect(text).toContain('searchable');
      expect(text).toContain('text');
    } finally {
      await document.destroy();
    }
  });
});
