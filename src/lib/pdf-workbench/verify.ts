import { WorkbenchError, isCancellationError, throwIfAborted } from './errors';
import { extractPageText, openPdf } from './pdfjs';
import { ResourceScope } from './resource-scope';

export interface ExpectedPage {
  pageNumber?: number;
  width?: number;
  height?: number;
  rotation?: number;
}

export interface PdfVerificationOptions {
  pageCount?: number;
  pages?: ExpectedPage[];
  expectedText?: string[];
  signal?: AbortSignal;
}

const closeEnough = (left: number, right: number): boolean =>
  Math.abs(left - right) < 0.5;

export async function verifyPdfOutput(
  bytes: ArrayBuffer | Uint8Array,
  expected: PdfVerificationOptions
): Promise<void> {
  const scope = new ResourceScope();
  try {
    throwIfAborted(expected.signal);
    const copy = bytes instanceof Uint8Array ? bytes.slice() : bytes.slice(0);
    const document = await openPdf(copy, scope, { signal: expected.signal });
    throwIfAborted(expected.signal);
    if (
      expected.pageCount !== undefined &&
      document.numPages !== expected.pageCount
    ) {
      throw new WorkbenchError({
        code: 'output-verification-failed',
        message: `The generated PDF has ${document.numPages} pages; ${expected.pageCount} were expected.`
      });
    }

    for (let index = 0; index < (expected.pages?.length ?? 0); index += 1) {
      throwIfAborted(expected.signal);
      const expectation = expected.pages?.[index];
      if (!expectation) continue;
      const pageNumber = expectation.pageNumber ?? index + 1;
      if (pageNumber > document.numPages) {
        throw new WorkbenchError({
          code: 'output-verification-failed',
          message: `Generated page ${pageNumber} is unavailable.`
        });
      }
      const page = await document.getPage(pageNumber);
      try {
        throwIfAborted(expected.signal);
        const viewport = page.getViewport({ scale: 1 });
        if (
          expectation.width !== undefined &&
          !closeEnough(viewport.width, expectation.width)
        ) {
          throw new WorkbenchError({
            code: 'output-verification-failed',
            message: `Generated page ${pageNumber} has an unexpected width.`
          });
        }
        if (
          expectation.height !== undefined &&
          !closeEnough(viewport.height, expectation.height)
        ) {
          throw new WorkbenchError({
            code: 'output-verification-failed',
            message: `Generated page ${pageNumber} has an unexpected height.`
          });
        }
        if (
          expectation.rotation !== undefined &&
          page.rotate !== expectation.rotation
        ) {
          throw new WorkbenchError({
            code: 'output-verification-failed',
            message: `Generated page ${pageNumber} has an unexpected rotation.`
          });
        }
      } finally {
        page.cleanup();
      }
    }

    if (expected.expectedText?.length) {
      const text: string[] = [];
      for (
        let pageNumber = 1;
        pageNumber <= document.numPages;
        pageNumber += 1
      ) {
        throwIfAborted(expected.signal);
        const page = await document.getPage(pageNumber);
        try {
          text.push(await extractPageText(page));
          throwIfAborted(expected.signal);
        } finally {
          page.cleanup();
        }
      }
      const normalized = normalizeText(text.join(' '));
      for (const expectedText of expected.expectedText) {
        if (!normalized.includes(normalizeText(expectedText))) {
          throw new WorkbenchError({
            code: 'output-verification-failed',
            message:
              'Expected searchable text was not found in the generated PDF.'
          });
        }
      }
    }
  } catch (error) {
    if (isCancellationError(error)) throw error;
    if (error instanceof WorkbenchError) throw error;
    throw new WorkbenchError({
      code: 'output-verification-failed',
      message: 'The generated PDF could not be reopened for verification.',
      details: error instanceof Error ? error.message : String(error)
    });
  } finally {
    await scope.dispose();
  }
}

export function normalizeText(value: string): string {
  return value.normalize('NFKC').replace(/\s+/g, ' ').trim().toLowerCase();
}
