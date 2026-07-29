import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  PDFPageProxy,
  RenderTask
} from 'pdfjs-dist';
import { getPdfJs } from '../../../../lib/pdf-workbench/pdfjs';
import { BrowserOutputVerification, OrganizerPage } from './types';

const abortError = () =>
  new DOMException('The operation was cancelled.', 'AbortError');

const assetUrl = (path: string): string => {
  const base = import.meta.env.BASE_URL || '/';
  return `${
    base.endsWith('/') ? base : `${base}/`
  }pdf-workbench/runtime/${path}`;
};

const normalizedText = (items: readonly unknown[]): string =>
  items
    .map((item) =>
      typeof item === 'object' &&
      item !== null &&
      'str' in item &&
      typeof item.str === 'string'
        ? item.str
        : ''
    )
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

const closeEnough = (left: number, right: number): boolean =>
  Math.abs(left - right) <= 0.1;

const normalizeRotation = (rotation: number): number =>
  ((rotation % 360) + 360) % 360;

const FINGERPRINT_LONG_EDGE = 256;

export const createRenderedPageFingerprint = async (
  pixels: Uint8ClampedArray,
  width: number,
  height: number
): Promise<string> => {
  const payload = new Uint8Array(8 + pixels.byteLength);
  const dimensions = new DataView(payload.buffer);
  dimensions.setUint32(0, width);
  dimensions.setUint32(4, height);
  payload.set(pixels, 8);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', payload);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

export const createBlankPageFingerprint = (
  width: number,
  height: number
): Promise<string> => {
  const whitePixels = new Uint8ClampedArray(width * height * 4);
  whitePixels.fill(255);
  return createRenderedPageFingerprint(whitePixels, width, height);
};

interface RenderedPageFingerprint {
  hash: string;
  width: number;
  height: number;
}

interface SourcePageEvidence {
  width: number;
  height: number;
  rotation: number;
  text: string;
  renderedFingerprint: string;
}

export interface PdfThumbnailRenderer {
  renderPage(
    sourceIndex: number,
    canvas: HTMLCanvasElement,
    signal?: AbortSignal
  ): Promise<void>;
  verifyOutput(
    output: ArrayBuffer,
    expectedPages: readonly OrganizerPage[],
    signal?: AbortSignal
  ): Promise<BrowserOutputVerification>;
  destroy(): Promise<void>;
}

class PdfThumbnailRendererImpl implements PdfThumbnailRenderer {
  private readonly renderTasks = new Set<RenderTask>();
  private readonly verificationLoadingTasks = new Set<PDFDocumentLoadingTask>();
  private destroyed = false;

  constructor(
    private readonly loadingTask: PDFDocumentLoadingTask,
    private readonly document: PDFDocumentProxy
  ) {}

  async renderPage(
    sourceIndex: number,
    canvas: HTMLCanvasElement,
    signal?: AbortSignal
  ): Promise<void> {
    if (this.destroyed || signal?.aborted) throw abortError();

    const page = await this.document.getPage(sourceIndex + 1);
    if (this.destroyed || signal?.aborted) {
      page.cleanup();
      throw abortError();
    }

    const initialViewport = page.getViewport({ scale: 1 });
    const scale = Math.min(
      180 / initialViewport.width,
      230 / initialViewport.height
    );
    const viewport = page.getViewport({ scale });
    const outputScale = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.max(1, Math.floor(viewport.width * outputScale));
    canvas.height = Math.max(1, Math.floor(viewport.height * outputScale));
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    const renderTask = page.render({
      canvas,
      viewport,
      transform:
        outputScale === 1 ? undefined : [outputScale, 0, 0, outputScale, 0, 0],
      background: '#ffffff'
    });
    this.renderTasks.add(renderTask);
    const cancelRender = () => renderTask.cancel();
    signal?.addEventListener('abort', cancelRender, { once: true });

    try {
      await renderTask.promise;
    } finally {
      signal?.removeEventListener('abort', cancelRender);
      this.renderTasks.delete(renderTask);
      page.cleanup();
    }
  }

  private assertActive(signal?: AbortSignal): void {
    if (this.destroyed || signal?.aborted) throw abortError();
  }

  private async fingerprintPage(
    page: PDFPageProxy,
    signal?: AbortSignal
  ): Promise<RenderedPageFingerprint> {
    this.assertActive(signal);
    const initialViewport = page.getViewport({ scale: 1 });
    const scale =
      FINGERPRINT_LONG_EDGE /
      Math.max(initialViewport.width, initialViewport.height, 1);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(viewport.width));
    canvas.height = Math.max(1, Math.round(viewport.height));
    const context = canvas.getContext('2d', {
      alpha: false,
      willReadFrequently: true
    });
    if (!context) {
      canvas.width = 1;
      canvas.height = 1;
      throw new Error(
        'The browser could not create a canvas for page verification.'
      );
    }

    const renderTask = page.render({
      canvas,
      canvasContext: context,
      viewport,
      background: '#ffffff'
    });
    this.renderTasks.add(renderTask);
    const cancelRender = () => renderTask.cancel();
    signal?.addEventListener('abort', cancelRender, { once: true });

    try {
      await renderTask.promise;
      this.assertActive(signal);
      const image = context.getImageData(0, 0, canvas.width, canvas.height);
      const hash = await createRenderedPageFingerprint(
        image.data,
        image.width,
        image.height
      );
      this.assertActive(signal);
      return { hash, width: image.width, height: image.height };
    } catch (error) {
      if (this.destroyed || signal?.aborted) throw abortError();
      throw error;
    } finally {
      signal?.removeEventListener('abort', cancelRender);
      this.renderTasks.delete(renderTask);
      canvas.width = 1;
      canvas.height = 1;
    }
  }

  private async collectSourceEvidence(
    sourceIndex: number,
    signal?: AbortSignal
  ): Promise<SourcePageEvidence> {
    this.assertActive(signal);
    const sourcePage = await this.document.getPage(sourceIndex + 1);
    try {
      this.assertActive(signal);
      const [x1, y1, x2, y2] = sourcePage.view;
      const text = normalizedText((await sourcePage.getTextContent()).items);
      this.assertActive(signal);
      return {
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1),
        rotation: normalizeRotation(sourcePage.rotate),
        text,
        renderedFingerprint: (await this.fingerprintPage(sourcePage, signal))
          .hash
      };
    } finally {
      sourcePage.cleanup();
    }
  }

  async verifyOutput(
    output: ArrayBuffer,
    expectedPages: readonly OrganizerPage[],
    signal?: AbortSignal
  ): Promise<BrowserOutputVerification> {
    if (this.destroyed || signal?.aborted) throw abortError();

    const pdfjs = await getPdfJs();
    if (this.destroyed || signal?.aborted) throw abortError();
    const outputLoadingTask = pdfjs.getDocument({
      data: output.slice(0),
      stopAtErrors: true,
      cMapUrl: assetUrl('pdfjs/cmaps/'),
      cMapPacked: true,
      standardFontDataUrl: assetUrl('pdfjs/standard_fonts/'),
      wasmUrl: assetUrl('pdfjs/wasm/'),
      isEvalSupported: false,
      useSystemFonts: false
    });
    this.verificationLoadingTasks.add(outputLoadingTask);
    const cancelLoading = () => {
      void outputLoadingTask.destroy();
    };
    signal?.addEventListener('abort', cancelLoading, { once: true });

    let outputDocument: PDFDocumentProxy | null = null;
    try {
      outputDocument = await outputLoadingTask.promise;
      if (signal?.aborted) throw abortError();
      if (outputDocument.numPages !== expectedPages.length) {
        return {
          verified: false,
          pageCount: outputDocument.numPages,
          geometryMatches: false,
          textMatches: false,
          visualMatches: false,
          textPagesChecked: 0,
          visualPagesChecked: 0,
          blankPagesChecked: 0
        };
      }

      let geometryMatches = true;
      let textMatches = true;
      let visualMatches = true;
      let textPagesChecked = 0;
      let visualPagesChecked = 0;
      let blankPagesChecked = 0;
      const sourceEvidence = new Map<number, SourcePageEvidence>();
      const blankFingerprints = new Map<string, string>();

      for (let index = 0; index < expectedPages.length; index += 1) {
        this.assertActive(signal);
        const expected = expectedPages[index];
        let expectedWidth = expected.width;
        let expectedHeight = expected.height;
        let expectedRotation = normalizeRotation(expected.rotation);
        let evidence: SourcePageEvidence | null = null;

        if (expected.kind === 'source') {
          evidence = sourceEvidence.get(expected.sourceIndex) ?? null;
          if (!evidence) {
            evidence = await this.collectSourceEvidence(
              expected.sourceIndex,
              signal
            );
            sourceEvidence.set(expected.sourceIndex, evidence);
          }
          expectedWidth = evidence.width;
          expectedHeight = evidence.height;
          expectedRotation = evidence.rotation;
        }

        const outputPage = await outputDocument.getPage(index + 1);
        try {
          this.assertActive(signal);
          const [x1, y1, x2, y2] = outputPage.view;
          const outputWidth = Math.abs(x2 - x1);
          const outputHeight = Math.abs(y2 - y1);
          if (
            !closeEnough(outputWidth, expectedWidth) ||
            !closeEnough(outputHeight, expectedHeight) ||
            normalizeRotation(outputPage.rotate) !== expectedRotation
          ) {
            geometryMatches = false;
          }

          const outputText = normalizedText(
            (await outputPage.getTextContent()).items
          );
          this.assertActive(signal);

          if (expected.kind === 'blank') {
            blankPagesChecked += 1;
            if (outputText.length > 0) textMatches = false;
            visualPagesChecked += 1;
            const rendered = await this.fingerprintPage(outputPage, signal);
            const blankKey = `${rendered.width}x${rendered.height}`;
            let blankFingerprint = blankFingerprints.get(blankKey);
            if (!blankFingerprint) {
              blankFingerprint = await createBlankPageFingerprint(
                rendered.width,
                rendered.height
              );
              blankFingerprints.set(blankKey, blankFingerprint);
            }
            if (rendered.hash !== blankFingerprint) visualMatches = false;
            continue;
          }

          if (evidence?.text) {
            textPagesChecked += 1;
            if (evidence.text !== outputText) textMatches = false;
          } else if (outputText.length > 0) {
            textMatches = false;
          }

          visualPagesChecked += 1;
          const outputFingerprint = await this.fingerprintPage(
            outputPage,
            signal
          );
          if (
            !evidence?.renderedFingerprint ||
            evidence.renderedFingerprint !== outputFingerprint.hash
          ) {
            visualMatches = false;
          }
        } finally {
          outputPage.cleanup();
        }
      }

      return {
        verified: geometryMatches && textMatches && visualMatches,
        pageCount: outputDocument.numPages,
        geometryMatches,
        textMatches,
        visualMatches,
        textPagesChecked,
        visualPagesChecked,
        blankPagesChecked
      };
    } catch (error) {
      if (this.destroyed || signal?.aborted) throw abortError();
      throw error;
    } finally {
      signal?.removeEventListener('abort', cancelLoading);
      this.verificationLoadingTasks.delete(outputLoadingTask);
      await outputLoadingTask.destroy().catch(() => undefined);
    }
  }

  async destroy(): Promise<void> {
    if (this.destroyed) return;
    this.destroyed = true;
    for (const renderTask of this.renderTasks) renderTask.cancel();
    this.renderTasks.clear();
    const verificationTasks = [...this.verificationLoadingTasks];
    this.verificationLoadingTasks.clear();
    await Promise.all(
      verificationTasks.map((task) => task.destroy().catch(() => undefined))
    );
    await this.loadingTask.destroy();
  }
}

export const createPdfThumbnailRenderer = async (
  source: ArrayBuffer,
  signal?: AbortSignal
): Promise<PdfThumbnailRenderer> => {
  if (signal?.aborted) throw abortError();
  const pdfjs = await getPdfJs();
  if (signal?.aborted) throw abortError();
  const loadingTask = pdfjs.getDocument({
    data: source,
    stopAtErrors: true,
    cMapUrl: assetUrl('pdfjs/cmaps/'),
    cMapPacked: true,
    standardFontDataUrl: assetUrl('pdfjs/standard_fonts/'),
    wasmUrl: assetUrl('pdfjs/wasm/'),
    isEvalSupported: false,
    useSystemFonts: false
  });
  const cancelLoading = () => {
    void loadingTask.destroy();
  };
  signal?.addEventListener('abort', cancelLoading, { once: true });

  try {
    const document = await loadingTask.promise;
    if (signal?.aborted) {
      await document.destroy();
      throw abortError();
    }
    return new PdfThumbnailRendererImpl(loadingTask, document);
  } catch (error) {
    await loadingTask.destroy();
    throw error;
  } finally {
    signal?.removeEventListener('abort', cancelLoading);
  }
};
