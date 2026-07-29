import fontkit from '@pdf-lib/fontkit';
import {
  degrees,
  PDFDocument,
  PDFPage,
  rgb,
  StandardFonts,
  type PDFFont,
  type PDFImage
} from 'pdf-lib';
import { parsePageRanges } from '../../../../lib/pdf-workbench/page-ranges';
import { WorkbenchError } from '../../../../lib/pdf-workbench/errors';
import { formatBatesNumber, formatPageNumber } from './formatters';
import {
  calculatePageAwarePlacement,
  imageDimensions,
  textDimensions
} from './placement';
import { getStampValidationError } from './validation';
import type {
  StampOptions,
  StampWorkerPayload,
  StampWorkerResult
} from './types';

type FontKind = 'default' | 'arabic' | 'cjk';

export async function stampPdf(
  payload: StampWorkerPayload,
  onProgress: (completed: number, total: number, pageNumber: number) => void,
  isCancelled: () => boolean
): Promise<StampWorkerResult> {
  const validationError = getStampValidationError(payload.options, {
    present: payload.imageBytes !== undefined,
    mimeType: payload.imageType
  });
  if (validationError) {
    throw new WorkbenchError({
      code: 'invalid-input',
      message: `Invalid stamp options: ${validationError}.`
    });
  }
  const source = await PDFDocument.load(payload.pdfBytes, {
    updateMetadata: false
  });
  source.registerFontkit(fontkit);
  const pages = source.getPages();
  const selected = parsePageRanges(payload.options.pageRange, pages.length);
  const image = await embedImage(source, payload);
  const fonts = new Map<FontKind, PDFFont>();

  for (let index = 0; index < selected.length; index += 1) {
    if (isCancelled()) {
      throw new WorkbenchError({
        code: 'cancelled',
        message: 'Stamping was cancelled.'
      });
    }
    const pageNumber = selected[index];
    const page = pages[pageNumber - 1];
    await stampPage({
      document: source,
      page,
      pageNumber,
      pageIndex: pageNumber - 1,
      selectionIndex: index,
      totalPages: pages.length,
      options: payload.options,
      image,
      fontBytes: payload.fontBytes,
      fonts
    });
    if (payload.options.layer === 'below') moveNewestContentBelow(page);
    onProgress(index + 1, selected.length, pageNumber);
  }

  const bytes = await source.save({ useObjectStreams: true });
  return {
    bytes: Uint8Array.from(bytes).buffer,
    pageCount: pages.length,
    stampedPages: selected
  };
}

async function stampPage({
  document,
  page,
  pageNumber,
  pageIndex,
  selectionIndex,
  totalPages,
  options,
  image,
  fontBytes,
  fonts
}: {
  document: PDFDocument;
  page: PDFPage;
  pageNumber: number;
  pageIndex: number;
  selectionIndex: number;
  totalPages: number;
  options: StampOptions;
  image?: PDFImage;
  fontBytes?: StampWorkerPayload['fontBytes'];
  fonts: Map<FontKind, PDFFont>;
}): Promise<void> {
  if (options.mode === 'image') {
    if (!image) {
      throw new WorkbenchError({
        code: 'invalid-input',
        message: 'Choose a PNG or JPEG watermark image.'
      });
    }
    drawImage(page, image, options);
    return;
  }

  if (options.mode === 'header-footer') {
    if (options.headerText) {
      await drawText(
        document,
        page,
        options.headerText,
        { ...options, position: 'top-center' },
        fontBytes,
        fonts
      );
    }
    if (options.footerText) {
      await drawText(
        document,
        page,
        options.footerText,
        { ...options, position: 'bottom-center' },
        fontBytes,
        fonts
      );
    }
    return;
  }

  const text =
    options.mode === 'page-numbers'
      ? formatPageNumber(
          options.pageNumberFormat,
          pageIndex,
          totalPages,
          options.startingPageNumber
        )
      : options.mode === 'bates'
        ? formatBatesNumber(
            selectionIndex,
            options.batesStart,
            options.batesPadding,
            options.batesPrefix,
            options.batesSuffix
          )
        : options.text;
  if (!text) {
    throw new WorkbenchError({
      code: 'invalid-input',
      message: `No stamp text was provided for page ${pageNumber}.`
    });
  }
  await drawText(document, page, text, options, fontBytes, fonts);
}

async function drawText(
  document: PDFDocument,
  page: PDFPage,
  text: string,
  options: StampOptions,
  fontBytes: StampWorkerPayload['fontBytes'],
  fonts: Map<FontKind, PDFFont>
): Promise<void> {
  const font = await resolveFont(document, text, fontBytes, fonts);
  const dimensions = textDimensions(font, text, options.fontSize);
  const { width, height } = page.getSize();
  const placement = calculatePageAwarePlacement({
    pageWidth: width,
    pageHeight: height,
    pageRotation: page.getRotation().angle,
    contentWidth: dimensions.width,
    contentHeight: dimensions.height,
    contentRotation: options.rotation,
    position: options.position,
    horizontalMargin: options.horizontalMargin,
    verticalMargin: options.verticalMargin
  });
  const color = parseHexColor(options.color);
  page.drawText(text, {
    ...placement,
    font,
    size: options.fontSize,
    opacity: clamp(options.opacity, 0, 1),
    rotate: degrees(placement.rotation),
    color: rgb(color.r, color.g, color.b)
  });
}

function drawImage(
  page: PDFPage,
  image: PDFImage,
  options: StampOptions
): void {
  const dimensions = imageDimensions(
    image,
    options.imageScale,
    options.preserveAspectRatio
  );
  const { width, height } = page.getSize();
  const placement = calculatePageAwarePlacement({
    pageWidth: width,
    pageHeight: height,
    pageRotation: page.getRotation().angle,
    contentWidth: dimensions.width,
    contentHeight: dimensions.height,
    contentRotation: options.rotation,
    position: options.position,
    horizontalMargin: options.horizontalMargin,
    verticalMargin: options.verticalMargin
  });
  page.drawImage(image, {
    ...placement,
    ...dimensions,
    opacity: clamp(options.opacity, 0, 1),
    rotate: degrees(placement.rotation)
  });
}

async function embedImage(
  document: PDFDocument,
  payload: StampWorkerPayload
): Promise<PDFImage | undefined> {
  if (!payload.imageBytes) return undefined;
  if (payload.imageType === 'image/png') {
    return document.embedPng(payload.imageBytes);
  }
  if (payload.imageType === 'image/jpeg') {
    return document.embedJpg(payload.imageBytes);
  }
  throw new WorkbenchError({
    code: 'invalid-input',
    message: 'Image watermarks must be PNG or JPEG files.'
  });
}

async function resolveFont(
  document: PDFDocument,
  text: string,
  fontBytes: StampWorkerPayload['fontBytes'],
  fonts: Map<FontKind, PDFFont>
): Promise<PDFFont> {
  const kind: FontKind = /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/u.test(text)
    ? 'cjk'
    : /[\u0600-\u06ff\u0750-\u077f]/u.test(text)
      ? 'arabic'
      : 'default';
  const cached = fonts.get(kind);
  if (cached) return cached;
  const data = fontBytes?.[kind];
  const font = data
    ? await document.embedFont(data, { subset: true })
    : document.embedStandardFont(StandardFonts.Helvetica);
  fonts.set(kind, font);
  return font;
}

function moveNewestContentBelow(page: PDFPage): void {
  const contents = page.node.normalizedEntries().Contents;
  if (!contents || contents.size() < 2) return;
  const newest = contents.get(contents.size() - 1);
  contents.remove(contents.size() - 1);
  contents.insert(0, newest);
}

function parseHexColor(value: string): { r: number; g: number; b: number } {
  const match = /^#?([0-9a-f]{6})$/i.exec(value);
  if (!match) {
    throw new WorkbenchError({
      code: 'invalid-input',
      message: 'Choose a valid six-digit stamp color.'
    });
  }
  const numeric = Number.parseInt(match[1], 16);
  return {
    r: ((numeric >> 16) & 255) / 255,
    g: ((numeric >> 8) & 255) / 255,
    b: (numeric & 255) / 255
  };
}

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));
