import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import { WorkbenchError, throwIfAborted } from './errors';
import { ResourceScope } from './resource-scope';

let pdfJsPromise: Promise<typeof import('pdfjs-dist')> | null = null;

const assetUrl = (path: string): string => {
  const base = import.meta.env.BASE_URL || '/';
  return `${
    base.endsWith('/') ? base : `${base}/`
  }pdf-workbench/runtime/${path}`;
};

export async function getPdfJs(): Promise<typeof import('pdfjs-dist')> {
  if (!pdfJsPromise) {
    pdfJsPromise = Promise.all([
      import('pdfjs-dist'),
      import('pdfjs-dist/build/pdf.worker.min.mjs?url')
    ]).then(([pdfjs, worker]) => {
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
      return pdfjs;
    });
  }
  return pdfJsPromise;
}

export async function openPdf(
  data: ArrayBuffer | Uint8Array,
  scope: ResourceScope,
  options: { password?: string; signal?: AbortSignal } = {}
): Promise<PDFDocumentProxy> {
  throwIfAborted(options.signal);
  const pdfjs = await getPdfJs();
  const loadingTask = pdfjs.getDocument({
    data,
    password: options.password,
    cMapUrl: assetUrl('pdfjs/cmaps/'),
    cMapPacked: true,
    standardFontDataUrl: assetUrl('pdfjs/standard_fonts/'),
    wasmUrl: assetUrl('pdfjs/wasm/'),
    isEvalSupported: false,
    useSystemFonts: false
  });
  scope.trackDestroyable(loadingTask);
  const cancelLoading = () => {
    void loadingTask.destroy();
  };
  options.signal?.addEventListener('abort', cancelLoading, { once: true });

  try {
    const document = await loadingTask.promise;
    scope.trackDestroyable(document);
    throwIfAborted(options.signal);
    return document;
  } catch (error) {
    throwIfAborted(options.signal);
    if (
      typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      (error.name === 'PasswordException' ||
        error.name === 'MissingPDFException')
    ) {
      throw new WorkbenchError({
        code: 'password-required',
        message: 'This PDF requires a password before it can be inspected.',
        details: error instanceof Error ? error.message : String(error)
      });
    }
    throw new WorkbenchError({
      code: 'pdf-load-failed',
      message: 'The selected file could not be opened as a valid PDF.',
      details: error instanceof Error ? error.message : String(error)
    });
  } finally {
    options.signal?.removeEventListener('abort', cancelLoading);
  }
}

export async function renderPageToCanvas(
  page: PDFPageProxy,
  canvas: HTMLCanvasElement,
  scale: number,
  options: {
    signal?: AbortSignal;
    background?: string;
    scope?: ResourceScope;
  } = {}
): Promise<{ width: number; height: number }> {
  throwIfAborted(options.signal);
  const viewport = page.getViewport({ scale });
  canvas.width = Math.max(1, Math.ceil(viewport.width));
  canvas.height = Math.max(1, Math.ceil(viewport.height));
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) {
    throw new WorkbenchError({
      code: 'unsupported',
      message: 'This browser could not create a PDF rendering canvas.'
    });
  }
  const renderTask = page.render({
    canvas,
    canvasContext: context,
    viewport,
    background: options.background ?? '#ffffff'
  });
  options.scope?.trackCancellable(renderTask);
  const abort = () => renderTask.cancel();
  options.signal?.addEventListener('abort', abort, { once: true });
  try {
    await renderTask.promise;
    throwIfAborted(options.signal);
    return { width: canvas.width, height: canvas.height };
  } finally {
    options.signal?.removeEventListener('abort', abort);
    page.cleanup();
  }
}

export async function extractPageText(page: PDFPageProxy): Promise<string> {
  const content = await page.getTextContent();
  return content.items
    .map((item) => ('str' in item ? item.str : ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}
