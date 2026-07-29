import {
  GlobalWorkerOptions,
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  PDFPageProxy,
  PDFWorker,
  getDocument
} from 'pdfjs-dist';
import pdfJsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { diffWordsWithSpace } from 'diff';
import {
  ComparePdfOptions,
  ComparedDocument,
  ComparisonProgress,
  ComparisonResult,
  PageComparison,
  PageGeometry,
  PagePresence,
  PageVisualAssets,
  TextComparison,
  TextDiffSegment,
  VisualComparison
} from './types';
import {
  ComparePdfError,
  VisualDiffWorkerError,
  createAbortError,
  isAbortError,
  throwIfAborted
} from './errors';
import {
  VisualDiffWorkerClient,
  createVisualDiffRequestId
} from './worker-client';
import { assembleComparisonReport, finalizePageComparison } from './report';
import { validateComparisonInputs } from './validation';

GlobalWorkerOptions.workerSrc = pdfJsWorkerUrl;

const MAX_RENDER_DIMENSION = 1200;
const MAX_RENDER_SCALE = 2;
const TEXT_DIFF_TIMEOUT_MS = 1500;

function runtimeAssetUrl(path: string): string {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${normalizedBase}pdf-workbench/runtime/${path}`;
}

interface RenderedPair {
  pixelsA: ArrayBuffer | null;
  pixelsB: ArrayBuffer | null;
  documentAUrl: string | null;
  documentBUrl: string | null;
  width: number;
  height: number;
}

interface PageContext {
  pageNumber: number;
  pageA: PDFPageProxy | null;
  pageB: PDFPageProxy | null;
  geometryA: PageGeometry | null;
  geometryB: PageGeometry | null;
}

function emitProgress(
  options: ComparePdfOptions,
  progress: ComparisonProgress
): void {
  options.onProgress?.({
    ...progress,
    percent: Math.max(0, Math.min(100, progress.percent))
  });
}

function pageProgressPercent(
  completedPages: number,
  pageFraction: number,
  totalPages: number
): number {
  if (totalPages === 0) {
    return 95;
  }
  return 8 + ((completedPages + pageFraction) / totalPages) * 87;
}

function normalizeRotation(rotation: number): number {
  return ((Math.round(rotation) % 360) + 360) % 360;
}

export function getPageGeometry(page: PDFPageProxy): PageGeometry {
  const [x1, y1, x2, y2] = page.view;
  return {
    widthPoints: Math.abs(x2 - x1) * page.userUnit,
    heightPoints: Math.abs(y2 - y1) * page.userUnit,
    rotation: normalizeRotation(page.rotate)
  };
}

function geometryDiffers(
  geometryA: PageGeometry | null,
  geometryB: PageGeometry | null
): boolean {
  if (!geometryA || !geometryB) {
    return true;
  }
  return (
    Math.abs(geometryA.widthPoints - geometryB.widthPoints) > 0.01 ||
    Math.abs(geometryA.heightPoints - geometryB.heightPoints) > 0.01
  );
}

function metadataString(value: unknown): string | null {
  if (typeof value === 'string') {
    return value.trim() || null;
  }
  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return String(value);
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    const values = value
      .map(metadataString)
      .filter((entry): entry is string => entry !== null);
    return values.length ? values.join(', ') : null;
  }
  return null;
}

async function readMetadata(
  pdf: PDFDocumentProxy
): Promise<Record<string, string>> {
  const { info, metadata } = await pdf.getMetadata();
  const normalized: Record<string, string> = {};

  Object.entries(info)
    .sort(([left], [right]) => left.localeCompare(right))
    .forEach(([key, value]) => {
      const stringValue = metadataString(value);
      if (stringValue !== null) {
        normalized[key] = stringValue;
      }
    });

  const xmpFields = [
    'dc:title',
    'dc:creator',
    'dc:description',
    'pdf:keywords',
    'pdf:producer',
    'xmp:creatortool',
    'xmp:createdate',
    'xmp:modifydate'
  ];
  xmpFields.forEach((field) => {
    const value = metadataString(metadata?.get(field));
    if (value !== null) {
      normalized[`xmp:${field}`] = value;
    }
  });

  return normalized;
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function requireCanvasContext(
  canvas: HTMLCanvasElement
): CanvasRenderingContext2D {
  const context = canvas.getContext('2d', {
    alpha: true,
    willReadFrequently: true
  });
  if (!context) {
    throw new ComparePdfError(
      'render-failed',
      'This browser could not create a canvas for PDF comparison.'
    );
  }
  return context;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }
      reject(
        new ComparePdfError(
          'render-failed',
          'A rendered PDF page could not be encoded for review.'
        )
      );
    }, 'image/png');
  });
}

async function canvasToTrackedUrl(
  canvas: HTMLCanvasElement,
  objectUrls: string[]
): Promise<string> {
  const blob = await canvasToBlob(canvas);
  const objectUrl = URL.createObjectURL(blob);
  objectUrls.push(objectUrl);
  return objectUrl;
}

function clearCanvas(canvas: HTMLCanvasElement | null): void {
  if (!canvas) {
    return;
  }
  canvas.width = 0;
  canvas.height = 0;
}

async function renderPage(
  page: PDFPageProxy,
  scale: number,
  signal: AbortSignal
): Promise<HTMLCanvasElement> {
  throwIfAborted(signal);
  const viewport = page.getViewport({ scale });
  const canvas = createCanvas(
    Math.max(1, Math.ceil(viewport.width)),
    Math.max(1, Math.ceil(viewport.height))
  );
  const canvasContext = requireCanvasContext(canvas);
  const renderTask = page.render({
    canvas,
    canvasContext,
    viewport,
    background: '#ffffff'
  });
  const cancelRender = () => {
    renderTask.cancel();
  };
  signal.addEventListener('abort', cancelRender, { once: true });

  try {
    await renderTask.promise;
    throwIfAborted(signal);
    return canvas;
  } catch (error) {
    clearCanvas(canvas);
    if (signal.aborted || isAbortError(error)) {
      throw createAbortError();
    }
    throw new ComparePdfError(
      'render-failed',
      `Page ${page.pageNumber} could not be rendered for visual comparison.`,
      page.pageNumber,
      { cause: error }
    );
  } finally {
    signal.removeEventListener('abort', cancelRender);
  }
}

function getSharedRenderScale(
  pageA: PDFPageProxy | null,
  pageB: PDFPageProxy | null
): number {
  const viewports = [pageA, pageB]
    .filter((page): page is PDFPageProxy => page !== null)
    .map((page) => page.getViewport({ scale: 1 }));
  const largestDimension = Math.max(
    1,
    ...viewports.flatMap(({ width, height }) => [width, height])
  );
  return Math.min(MAX_RENDER_SCALE, MAX_RENDER_DIMENSION / largestDimension);
}

async function renderNormalizedPair(
  pageA: PDFPageProxy | null,
  pageB: PDFPageProxy | null,
  signal: AbortSignal,
  objectUrls: string[]
): Promise<RenderedPair> {
  const scale = getSharedRenderScale(pageA, pageB);
  let renderedA: HTMLCanvasElement | null = null;
  let renderedB: HTMLCanvasElement | null = null;
  let normalizedA: HTMLCanvasElement | null = null;
  let normalizedB: HTMLCanvasElement | null = null;

  try {
    [renderedA, renderedB] = await Promise.all([
      pageA ? renderPage(pageA, scale, signal) : Promise.resolve(null),
      pageB ? renderPage(pageB, scale, signal) : Promise.resolve(null)
    ]);
    throwIfAborted(signal);

    const width = Math.max(renderedA?.width ?? 0, renderedB?.width ?? 0, 1);
    const height = Math.max(renderedA?.height ?? 0, renderedB?.height ?? 0, 1);

    if (renderedA) {
      normalizedA = createCanvas(width, height);
      requireCanvasContext(normalizedA).drawImage(renderedA, 0, 0);
    }
    if (renderedB) {
      normalizedB = createCanvas(width, height);
      requireCanvasContext(normalizedB).drawImage(renderedB, 0, 0);
    }

    const [documentAUrl, documentBUrl] = await Promise.all([
      normalizedA
        ? canvasToTrackedUrl(normalizedA, objectUrls)
        : Promise.resolve(null),
      normalizedB
        ? canvasToTrackedUrl(normalizedB, objectUrls)
        : Promise.resolve(null)
    ]);

    return {
      pixelsA: normalizedA
        ? requireCanvasContext(normalizedA).getImageData(0, 0, width, height)
            .data.buffer
        : null,
      pixelsB: normalizedB
        ? requireCanvasContext(normalizedB).getImageData(0, 0, width, height)
            .data.buffer
        : null,
      documentAUrl,
      documentBUrl,
      width,
      height
    };
  } finally {
    clearCanvas(renderedA);
    clearCanvas(renderedB);
    clearCanvas(normalizedA);
    clearCanvas(normalizedB);
  }
}

async function rgbaToTrackedUrl(
  pixels: ArrayBuffer,
  width: number,
  height: number,
  objectUrls: string[]
): Promise<string> {
  const canvas = createCanvas(width, height);
  try {
    const context = requireCanvasContext(canvas);
    context.putImageData(
      new ImageData(new Uint8ClampedArray(pixels), width, height),
      0,
      0
    );
    return await canvasToTrackedUrl(canvas, objectUrls);
  } finally {
    clearCanvas(canvas);
  }
}

function createMissingPageMask(width: number, height: number): ArrayBuffer {
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let offset = 0; offset < pixels.length; offset += 4) {
    pixels[offset] = 229;
    pixels[offset + 1] = 57;
    pixels[offset + 2] = 53;
    pixels[offset + 3] = 230;
  }
  return pixels.buffer;
}

function pagePresence(
  pageA: PDFPageProxy | null,
  pageB: PDFPageProxy | null
): PagePresence {
  if (!pageA) {
    return 'missing-from-a';
  }
  if (!pageB) {
    return 'missing-from-b';
  }
  return 'both';
}

function textItemToString(item: unknown): string {
  if (
    typeof item !== 'object' ||
    item === null ||
    !('str' in item) ||
    typeof item.str !== 'string'
  ) {
    return '';
  }
  const hasEndOfLine =
    'hasEOL' in item && typeof item.hasEOL === 'boolean' && item.hasEOL;
  return `${item.str}${hasEndOfLine ? '\n' : ' '}`;
}

async function extractPageText(
  page: PDFPageProxy | null,
  signal: AbortSignal
): Promise<string> {
  if (!page) {
    return '';
  }
  throwIfAborted(signal);
  try {
    const content = await page.getTextContent();
    throwIfAborted(signal);
    return content.items.map(textItemToString).join('').trim();
  } catch (error) {
    if (signal.aborted || isAbortError(error)) {
      throw createAbortError();
    }
    throw new ComparePdfError(
      'text-extraction-failed',
      `Text could not be extracted from page ${page.pageNumber}.`,
      page.pageNumber,
      { cause: error }
    );
  }
}

function unchangedTextComparison(
  textA: string,
  textB: string,
  status: TextComparison['status']
): TextComparison {
  const segments: TextDiffSegment[] = [];
  if (status === 'identical' && textA) {
    segments.push({ kind: 'unchanged', value: textA });
  } else {
    if (textA) {
      segments.push({ kind: 'removed', value: textA });
    }
    if (textB) {
      segments.push({ kind: 'added', value: textB });
    }
  }

  return {
    status,
    characterCountA: textA.length,
    characterCountB: textB.length,
    changedPercentage:
      status === 'no-text-layer' ? null : status === 'identical' ? 0 : 100,
    segments
  };
}

function changesToTextComparison(
  textA: string,
  textB: string,
  changes:
    | Array<{
        value: string;
        added: boolean;
        removed: boolean;
        count: number;
      }>
    | undefined
): TextComparison {
  if (!changes) {
    const segments: TextDiffSegment[] = [];
    if (textA) {
      segments.push({ kind: 'removed', value: textA });
    }
    if (textB) {
      segments.push({ kind: 'added', value: textB });
    }
    return {
      status: 'comparison-limited',
      characterCountA: textA.length,
      characterCountB: textB.length,
      changedPercentage: 100,
      segments
    };
  }

  let addedCharacters = 0;
  let removedCharacters = 0;
  const segments = changes.map<TextDiffSegment>((change) => {
    if (change.added) {
      addedCharacters += change.value.length;
      return { kind: 'added', value: change.value };
    }
    if (change.removed) {
      removedCharacters += change.value.length;
      return { kind: 'removed', value: change.value };
    }
    return { kind: 'unchanged', value: change.value };
  });
  const denominator = Math.max(textA.length, textB.length, 1);

  return {
    status: addedCharacters || removedCharacters ? 'changed' : 'identical',
    characterCountA: textA.length,
    characterCountB: textB.length,
    changedPercentage:
      (Math.max(addedCharacters, removedCharacters) / denominator) * 100,
    segments
  };
}

async function compareText(
  textA: string,
  textB: string,
  signal: AbortSignal
): Promise<TextComparison> {
  const hasTextA = textA.trim().length > 0;
  const hasTextB = textB.trim().length > 0;

  if (!hasTextA && !hasTextB) {
    return unchangedTextComparison(textA, textB, 'no-text-layer');
  }
  if (hasTextA && !hasTextB) {
    return unchangedTextComparison(textA, textB, 'only-a-has-text');
  }
  if (!hasTextA && hasTextB) {
    return unchangedTextComparison(textA, textB, 'only-b-has-text');
  }
  if (textA === textB) {
    return unchangedTextComparison(textA, textB, 'identical');
  }

  throwIfAborted(signal);
  return new Promise<TextComparison>((resolve, reject) => {
    let settled = false;
    const abort = () => {
      if (!settled) {
        settled = true;
        reject(createAbortError());
      }
    };
    signal.addEventListener('abort', abort, { once: true });

    try {
      diffWordsWithSpace(textA, textB, {
        timeout: TEXT_DIFF_TIMEOUT_MS,
        callback: (changes) => {
          if (settled) {
            return;
          }
          settled = true;
          signal.removeEventListener('abort', abort);
          try {
            resolve(changesToTextComparison(textA, textB, changes));
          } catch (error) {
            reject(
              new ComparePdfError(
                'text-extraction-failed',
                'The extracted text differences could not be calculated.',
                null,
                { cause: error }
              )
            );
          }
        }
      });
    } catch (error) {
      settled = true;
      signal.removeEventListener('abort', abort);
      reject(
        new ComparePdfError(
          'text-extraction-failed',
          'The extracted text differences could not be calculated.',
          null,
          { cause: error }
        )
      );
    }
  });
}

function createComparedDocument(
  file: File,
  pdf: PDFDocumentProxy,
  metadata: Record<string, string>
): ComparedDocument {
  return {
    fileName: file.name,
    byteSize: file.size,
    pageCount: pdf.numPages,
    metadata
  };
}

async function getPageContext(
  pageNumber: number,
  pdfA: PDFDocumentProxy,
  pdfB: PDFDocumentProxy,
  signal: AbortSignal
): Promise<PageContext> {
  throwIfAborted(signal);
  const [pageA, pageB] = await Promise.all([
    pageNumber <= pdfA.numPages
      ? pdfA.getPage(pageNumber)
      : Promise.resolve(null),
    pageNumber <= pdfB.numPages
      ? pdfB.getPage(pageNumber)
      : Promise.resolve(null)
  ]);
  throwIfAborted(signal);
  return {
    pageNumber,
    pageA,
    pageB,
    geometryA: pageA ? getPageGeometry(pageA) : null,
    geometryB: pageB ? getPageGeometry(pageB) : null
  };
}

function cleanupPage(page: PDFPageProxy | null): void {
  try {
    page?.cleanup();
  } catch {
    // PDF.js can already have released a page during document cancellation.
  }
}

function mapPdfLoadError(error: unknown): ComparePdfError {
  if (error instanceof ComparePdfError) {
    return error;
  }
  const errorName = error instanceof Error ? error.name : '';
  if (errorName === 'PasswordException') {
    return new ComparePdfError(
      'pdf-load-failed',
      'A password is required to open one of these PDFs. Unlock it before comparing.'
    );
  }
  if (errorName === 'InvalidPDFException') {
    return new ComparePdfError(
      'pdf-load-failed',
      'One of the selected files is malformed or is not a valid PDF.',
      null,
      { cause: error }
    );
  }
  return new ComparePdfError(
    'pdf-load-failed',
    'The selected PDF documents could not be opened in the browser.',
    null,
    { cause: error }
  );
}

async function destroyLoadingTask(
  loadingTask: PDFDocumentLoadingTask | null
): Promise<void> {
  if (!loadingTask) {
    return;
  }
  try {
    await loadingTask.destroy();
  } catch {
    // Destruction is best-effort after a failed or cancelled PDF.js load.
  }
}

export async function comparePdfFiles(
  fileA: File,
  fileB: File,
  options: ComparePdfOptions
): Promise<ComparisonResult> {
  const validationError = validateComparisonInputs(
    fileA,
    fileB,
    options.tolerance
  );
  if (validationError) {
    throw new ComparePdfError('invalid-input', validationError);
  }
  throwIfAborted(options.signal);

  const objectUrls: string[] = [];
  const visualAssets = new Map<number, PageVisualAssets>();
  let workerClient: VisualDiffWorkerClient | null = null;
  let pdfWorker: PDFWorker | null = null;
  let loadingTaskA: PDFDocumentLoadingTask | null = null;
  let loadingTaskB: PDFDocumentLoadingTask | null = null;
  let destroyDocumentsPromise: Promise<void> | null = null;
  const destroyDocuments = (): Promise<void> => {
    if (!destroyDocumentsPromise) {
      destroyDocumentsPromise = (async () => {
        await destroyLoadingTask(loadingTaskA);
        await destroyLoadingTask(loadingTaskB);
      })();
    }
    return destroyDocumentsPromise;
  };
  const abortDocuments = () => {
    void destroyDocuments();
  };
  options.signal.addEventListener('abort', abortDocuments, { once: true });

  emitProgress(options, {
    stage: 'loading',
    currentPage: null,
    completedPages: 0,
    totalPages: 0,
    percent: 1
  });

  try {
    pdfWorker = PDFWorker.create({ name: 'compare-pdf-parser' });
    const activeWorkerClient = new VisualDiffWorkerClient();
    workerClient = activeWorkerClient;
    const [bufferA, bufferB] = await Promise.all([
      fileA.arrayBuffer(),
      fileB.arrayBuffer()
    ]);
    throwIfAborted(options.signal);
    loadingTaskA = getDocument({
      data: new Uint8Array(bufferA),
      worker: pdfWorker,
      cMapUrl: runtimeAssetUrl('pdfjs/cmaps/'),
      cMapPacked: true,
      standardFontDataUrl: runtimeAssetUrl('pdfjs/standard_fonts/'),
      wasmUrl: runtimeAssetUrl('pdfjs/wasm/'),
      isEvalSupported: false,
      useSystemFonts: false,
      stopAtErrors: true
    });
    loadingTaskB = getDocument({
      data: new Uint8Array(bufferB),
      worker: pdfWorker,
      cMapUrl: runtimeAssetUrl('pdfjs/cmaps/'),
      cMapPacked: true,
      standardFontDataUrl: runtimeAssetUrl('pdfjs/standard_fonts/'),
      wasmUrl: runtimeAssetUrl('pdfjs/wasm/'),
      isEvalSupported: false,
      useSystemFonts: false,
      stopAtErrors: true
    });

    let pdfA: PDFDocumentProxy;
    let pdfB: PDFDocumentProxy;
    try {
      [pdfA, pdfB] = await Promise.all([
        loadingTaskA.promise,
        loadingTaskB.promise
      ]);
    } catch (error) {
      if (options.signal.aborted || isAbortError(error)) {
        throw createAbortError();
      }
      throw mapPdfLoadError(error);
    }

    throwIfAborted(options.signal);
    const totalPages = Math.max(pdfA.numPages, pdfB.numPages);
    emitProgress(options, {
      stage: 'reading-metadata',
      currentPage: null,
      completedPages: 0,
      totalPages,
      percent: 5
    });
    const [metadataA, metadataB] = await Promise.all([
      readMetadata(pdfA),
      readMetadata(pdfB)
    ]);
    throwIfAborted(options.signal);

    const pages: PageComparison[] = [];
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
      const completedPages = pageNumber - 1;
      const context = await getPageContext(
        pageNumber,
        pdfA,
        pdfB,
        options.signal
      );

      try {
        emitProgress(options, {
          stage: 'rendering',
          currentPage: pageNumber,
          completedPages,
          totalPages,
          percent: pageProgressPercent(completedPages, 0.05, totalPages)
        });
        const rendered = await renderNormalizedPair(
          context.pageA,
          context.pageB,
          options.signal,
          objectUrls
        );
        throwIfAborted(options.signal);

        const presence = pagePresence(context.pageA, context.pageB);
        let visual: VisualComparison;
        let differenceMask: ArrayBuffer;

        if (presence === 'both' && rendered.pixelsA && rendered.pixelsB) {
          const requestId = createVisualDiffRequestId(pageNumber);
          const cancelWorkerRequest = () => {
            activeWorkerClient.cancel(requestId);
          };
          options.signal.addEventListener('abort', cancelWorkerRequest, {
            once: true
          });
          try {
            const result = await activeWorkerClient.compare(
              {
                type: 'compare',
                requestId,
                pageNumber,
                width: rendered.width,
                height: rendered.height,
                tolerance: options.tolerance,
                pixelsA: rendered.pixelsA,
                pixelsB: rendered.pixelsB
              },
              (workerProgress) => {
                emitProgress(options, {
                  stage: 'comparing-visuals',
                  currentPage: pageNumber,
                  completedPages,
                  totalPages,
                  percent: pageProgressPercent(
                    completedPages,
                    0.35 + (workerProgress.percent / 100) * 0.4,
                    totalPages
                  )
                });
              }
            );
            differenceMask = result.differenceMask;
            visual = {
              changedPixels: result.changedPixels,
              totalPixels: result.totalPixels,
              changedPercentage: result.changedPercentage,
              tolerance: options.tolerance
            };
          } catch (error) {
            if (options.signal.aborted || isAbortError(error)) {
              throw createAbortError();
            }
            if (error instanceof VisualDiffWorkerError) {
              throw new ComparePdfError(
                'worker-failed',
                `Visual comparison failed on page ${pageNumber}: ${error.message}`,
                pageNumber,
                { cause: error }
              );
            }
            throw error;
          } finally {
            options.signal.removeEventListener('abort', cancelWorkerRequest);
          }
        } else {
          differenceMask = createMissingPageMask(
            rendered.width,
            rendered.height
          );
          const totalPixels = rendered.width * rendered.height;
          visual = {
            changedPixels: totalPixels,
            totalPixels,
            changedPercentage: 100,
            tolerance: options.tolerance
          };
        }

        const differenceMaskUrl = await rgbaToTrackedUrl(
          differenceMask,
          rendered.width,
          rendered.height,
          objectUrls
        );
        visualAssets.set(pageNumber, {
          pageNumber,
          documentAUrl: rendered.documentAUrl,
          documentBUrl: rendered.documentBUrl,
          differenceMaskUrl,
          normalizedWidth: rendered.width,
          normalizedHeight: rendered.height
        });

        emitProgress(options, {
          stage: 'extracting-text',
          currentPage: pageNumber,
          completedPages,
          totalPages,
          percent: pageProgressPercent(completedPages, 0.8, totalPages)
        });
        const [textA, textB] = await Promise.all([
          extractPageText(context.pageA, options.signal),
          extractPageText(context.pageB, options.signal)
        ]);
        const text = await compareText(textA, textB, options.signal);

        pages.push(
          finalizePageComparison({
            pageNumber,
            presence,
            documentA: context.geometryA,
            documentB: context.geometryB,
            dimensionsDiffer: geometryDiffers(
              context.geometryA,
              context.geometryB
            ),
            rotationDiffers:
              context.geometryA?.rotation !== context.geometryB?.rotation,
            visual,
            text
          })
        );
        emitProgress(options, {
          stage: 'extracting-text',
          currentPage: pageNumber,
          completedPages: pageNumber,
          totalPages,
          percent: pageProgressPercent(pageNumber, 0, totalPages)
        });
      } finally {
        cleanupPage(context.pageA);
        cleanupPage(context.pageB);
      }
    }

    emitProgress(options, {
      stage: 'finalizing',
      currentPage: null,
      completedPages: totalPages,
      totalPages,
      percent: 98
    });
    throwIfAborted(options.signal);
    const report = assembleComparisonReport({
      tolerance: options.tolerance,
      documentA: createComparedDocument(fileA, pdfA, metadataA),
      documentB: createComparedDocument(fileB, pdfB, metadataB),
      pages
    });
    throwIfAborted(options.signal);
    emitProgress(options, {
      stage: 'finalizing',
      currentPage: null,
      completedPages: totalPages,
      totalPages,
      percent: 100
    });
    return { report, visualAssets, objectUrls };
  } catch (error) {
    objectUrls.forEach((objectUrl) => {
      URL.revokeObjectURL(objectUrl);
    });
    visualAssets.clear();
    if (options.signal.aborted || isAbortError(error)) {
      throw createAbortError();
    }
    if (error instanceof ComparePdfError) {
      throw error;
    }
    throw new ComparePdfError(
      'unknown',
      'PDF comparison failed unexpectedly.',
      null,
      { cause: error }
    );
  } finally {
    options.signal.removeEventListener('abort', abortDocuments);
    workerClient?.dispose();
    await destroyDocuments();
    pdfWorker?.destroy();
  }
}
