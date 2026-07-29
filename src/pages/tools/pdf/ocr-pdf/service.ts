import fontkit from '@pdf-lib/fontkit';
import { degrees, PDFDocument, type PDFFont } from 'pdf-lib';
import {
  WorkbenchError,
  isCancellationError,
  throwIfAborted
} from '../../../../lib/pdf-workbench/errors';
import type {
  OcrBox,
  OcrJsonReport,
  OcrLine,
  OcrOptions,
  OcrPageResult,
  OcrWord,
  SearchablePdfWorkerPayload,
  SearchablePdfWorkerResult
} from './types';

export const DEFAULT_OCR_OPTIONS: OcrOptions = {
  pageRange: '',
  language: 'eng',
  dpi: 200,
  autoOrient: true,
  skipTextPages: true,
  meaningfulTextThreshold: 40
};

export async function buildSearchablePdf(
  payload: SearchablePdfWorkerPayload,
  onProgress: (completed: number, total: number, pageNumber: number) => void,
  isCancelled: () => boolean
): Promise<SearchablePdfWorkerResult> {
  const document = await PDFDocument.load(payload.pdfBytes, {
    updateMetadata: false
  });
  document.registerFontkit(fontkit);
  const font = await document.embedFont(payload.fontBytes, { subset: true });
  const pages = document.getPages();
  const searchablePages = payload.pages.filter(
    (page) => page.status === 'ocr' && page.words.length > 0
  );
  const unsupportedGlyphs = new Set<string>();

  for (let index = 0; index < searchablePages.length; index += 1) {
    if (isCancelled()) {
      throw new WorkbenchError({
        code: 'cancelled',
        message: 'Searchable PDF creation was cancelled.'
      });
    }
    const result = searchablePages[index];
    const page = pages[result.pageNumber - 1];
    if (!page) {
      throw new WorkbenchError({
        code: 'output-verification-failed',
        message: `Source page ${result.pageNumber} is unavailable.`,
        pageNumber: result.pageNumber
      });
    }

    for (const word of result.words) {
      drawInvisibleWord(page, font, result, word, unsupportedGlyphs);
    }
    onProgress(index + 1, searchablePages.length, result.pageNumber);
  }

  const bytes = await document.save({ useObjectStreams: true });
  return {
    bytes: Uint8Array.from(bytes).buffer,
    pageCount: pages.length,
    textLayerPages: searchablePages.map((page) => page.pageNumber),
    unsupportedGlyphs: [...unsupportedGlyphs]
  };
}

function drawInvisibleWord(
  page: ReturnType<PDFDocument['getPages']>[number],
  font: PDFFont,
  result: OcrPageResult,
  word: OcrWord,
  unsupportedGlyphs: Set<string>
): void {
  const text = retainSupportedGlyphs(word.text, font, unsupportedGlyphs).trim();
  if (!text || result.imageWidth <= 0 || result.imageHeight <= 0) return;

  const pageSize = page.getSize();
  const scaleX = pageSize.width / result.imageWidth;
  const scaleY = pageSize.height / result.imageHeight;
  const placement = word.pdfPlacement ?? {
    x: word.bbox.x0 * scaleX,
    y: pageSize.height - word.bbox.y1 * scaleY,
    width: (word.bbox.x1 - word.bbox.x0) * scaleX,
    height: (word.bbox.y1 - word.bbox.y0) * scaleY,
    rotation: 0
  };
  const boxWidth = Math.max(0.5, placement.width);
  const boxHeight = Math.max(1, placement.height);
  const naturalSize = Math.max(1, boxHeight * 0.82);
  const unitWidth = Math.max(0.01, font.widthOfTextAtSize(text, 1));
  const fontSize = Math.max(0.5, Math.min(naturalSize, boxWidth / unitWidth));

  page.drawText(text, {
    x: placement.x,
    y: placement.y,
    size: fontSize,
    font,
    opacity: 0,
    rotate: degrees(placement.rotation)
  });
}

function retainSupportedGlyphs(
  value: string,
  font: PDFFont,
  unsupportedGlyphs: Set<string>
): string {
  const supported = new Set(font.getCharacterSet());
  return [...value]
    .filter((character) => {
      const codePoint = character.codePointAt(0);
      const valid =
        codePoint !== undefined &&
        (/\s/u.test(character) || supported.has(codePoint));
      if (!valid) unsupportedGlyphs.add(character);
      return valid;
    })
    .join('');
}

export function collectOcrLines(
  blocks: Tesseract.Block[] | null | undefined
): OcrLine[] {
  if (!blocks) return [];
  return blocks.flatMap((block) =>
    block.paragraphs.flatMap((paragraph) =>
      paragraph.lines.map((line) => ({
        text: line.text.trim(),
        confidence: line.confidence,
        bbox: normalizeBox(line.bbox),
        words: line.words
          .map((word) => ({
            text: word.text.trim(),
            confidence: word.confidence,
            bbox: normalizeBox(word.bbox)
          }))
          .filter((word) => word.text.length > 0)
      }))
    )
  );
}

export function collectOcrWords(lines: OcrLine[]): OcrWord[] {
  return lines.flatMap((line) => line.words);
}

function normalizeBox(box: Tesseract.Bbox): OcrBox {
  return {
    x0: Math.max(0, Math.round(box.x0)),
    y0: Math.max(0, Math.round(box.y0)),
    x1: Math.max(0, Math.round(box.x1)),
    y1: Math.max(0, Math.round(box.y1))
  };
}

export function hasMeaningfulNativeText(
  text: string,
  threshold: number
): boolean {
  return text.replace(/\s/gu, '').length >= threshold;
}

export function shouldSkipNativeTextPage(
  text: string,
  options: Pick<OcrOptions, 'skipTextPages' | 'meaningfulTextThreshold'>
): boolean {
  return (
    options.skipTextPages &&
    hasMeaningfulNativeText(text, options.meaningfulTextThreshold)
  );
}

interface OcrPageSequenceArguments<TPage, TResult> {
  pageNumbers: readonly number[];
  options: Pick<OcrOptions, 'skipTextPages' | 'meaningfulTextThreshold'>;
  signal: AbortSignal;
  loadPage: (pageNumber: number, completed: number) => Promise<TPage>;
  readNativeText: (
    page: TPage,
    pageNumber: number,
    completed: number
  ) => Promise<string>;
  createNativeResult: (
    page: TPage,
    pageNumber: number,
    nativeText: string
  ) => TResult;
  recognizePage: (
    page: TPage,
    pageNumber: number,
    completed: number
  ) => Promise<TResult>;
  createFailedResult: (
    page: TPage,
    pageNumber: number,
    error: unknown
  ) => TResult;
  onPageComplete?: (
    result: TResult,
    pageNumber: number,
    completed: number,
    total: number
  ) => void | Promise<void>;
  cleanupPage?: (page: TPage, pageNumber: number) => void | Promise<void>;
}

/**
 * Runs selected pages serially so one Tesseract worker can be reused safely.
 * Abort checkpoints surround every awaited page stage, preventing a cancelled
 * job from starting the next page even when the current promise resolves.
 */
export async function processOcrPageSequence<TPage, TResult>({
  pageNumbers,
  options,
  signal,
  loadPage,
  readNativeText,
  createNativeResult,
  recognizePage,
  createFailedResult,
  onPageComplete,
  cleanupPage
}: OcrPageSequenceArguments<TPage, TResult>): Promise<TResult[]> {
  const results: TResult[] = [];

  for (const pageNumber of pageNumbers) {
    throwIfAborted(signal);
    const completed = results.length;
    const page = await loadPage(pageNumber, completed);

    try {
      throwIfAborted(signal);
      let result: TResult;

      try {
        const nativeText = await readNativeText(page, pageNumber, completed);
        throwIfAborted(signal);
        result = shouldSkipNativeTextPage(nativeText, options)
          ? createNativeResult(page, pageNumber, nativeText)
          : await recognizePage(page, pageNumber, completed);
        throwIfAborted(signal);
      } catch (error) {
        if (signal.aborted || isCancellationError(error)) throw error;
        result = createFailedResult(page, pageNumber, error);
      }

      results.push(result);
      await onPageComplete?.(
        result,
        pageNumber,
        results.length,
        pageNumbers.length
      );
      throwIfAborted(signal);
    } finally {
      await cleanupPage?.(page, pageNumber);
    }
  }

  return results;
}

interface PdfViewportForOcrPlacement {
  convertToPdfPoint: (x: number, y: number) => number[];
}

interface OcrRasterSize {
  width: number;
  height: number;
}

/**
 * Converts a Tesseract word box back through auto-orientation and into PDF
 * coordinates. Tesseract.js v6 rotates a fixed-size raster around its center
 * and reports boxes in that rotated raster, so the reported angle must be
 * inverted before applying PDF.js's viewport transform.
 */
export function mapOcrBoxToPdfPlacement(
  box: OcrBox,
  viewport: PdfViewportForOcrPlacement,
  raster: OcrRasterSize,
  rotateRadians: number | null | undefined
): NonNullable<OcrWord['pdfPlacement']> {
  const safeWidth = Math.max(1, raster.width);
  const safeHeight = Math.max(1, raster.height);
  const angle = Number.isFinite(rotateRadians) ? rotateRadians ?? 0 : 0;
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  const centerX = safeWidth / 2;
  const centerY = safeHeight / 2;

  const toPdfPoint = (x: number, y: number): number[] => {
    const offsetX = x - centerX;
    const offsetY = y - centerY;
    const originalX = centerX + cosine * offsetX + sine * offsetY;
    const originalY = centerY - sine * offsetX + cosine * offsetY;
    return viewport.convertToPdfPoint(originalX, originalY);
  };

  const [x, y] = toPdfPoint(box.x0, box.y1);
  const [rightX, rightY] = toPdfPoint(box.x1, box.y1);
  const [topX, topY] = toPdfPoint(box.x0, box.y0);
  return {
    x,
    y,
    width: Math.hypot(rightX - x, rightY - y),
    height: Math.hypot(topX - x, topY - y),
    rotation: (Math.atan2(rightY - y, rightX - x) * 180) / Math.PI
  };
}

export function createTextOutput(pages: OcrPageResult[]): string {
  return pages
    .map((page) => {
      const heading = `--- Page ${page.pageNumber} (${page.status}) ---`;
      return `${heading}\n${page.error ?? page.text}`.trimEnd();
    })
    .join('\n\n');
}

export function createJsonOutput(report: OcrJsonReport): string {
  return JSON.stringify(report, null, 2);
}

export function collectExpectedSearchableText(
  pages: OcrPageResult[]
): string[] {
  return pages
    .map((page) => {
      if (page.status === 'native') {
        return [...page.text.replace(/\s+/gu, ' ').trim()]
          .slice(0, 80)
          .join('')
          .trim();
      }
      if (page.status !== 'ocr') return '';
      return page.words
        .map((word) => word.text.replace(/\s+/gu, ' ').trim())
        .filter(Boolean)
        .slice(0, 3)
        .join(' ');
    })
    .filter(Boolean);
}
