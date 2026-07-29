import { degrees, PDFDocument, PDFSignature } from 'pdf-lib';
import {
  OrganizerErrorCode,
  OrganizerExportResult,
  OrganizerInspection,
  OrganizerPage,
  OrganizerProgress
} from './types';

export class OrganizerServiceError extends Error {
  constructor(
    readonly code: OrganizerErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'OrganizerServiceError';
  }
}

type ProgressCallback = (progress: OrganizerProgress) => void;

const report = (
  onProgress: ProgressCallback | undefined,
  stage: OrganizerProgress['stage'],
  current: number,
  total: number
) => onProgress?.({ stage, current, total });

const assertNotAborted = (signal?: AbortSignal) => {
  if (signal?.aborted) {
    throw new DOMException('The operation was cancelled.', 'AbortError');
  }
};

const toSourceBytes = (source: ArrayBuffer | Uint8Array): Uint8Array =>
  source instanceof Uint8Array ? source : new Uint8Array(source);

const loadPdf = async (
  source: ArrayBuffer | Uint8Array,
  code: OrganizerErrorCode
): Promise<PDFDocument> => {
  try {
    return await PDFDocument.load(toSourceBytes(source), {
      updateMetadata: false
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/encrypt|password/i.test(message)) {
      throw new OrganizerServiceError(
        'PASSWORD_REQUIRED',
        'This PDF is encrypted or requires a password and cannot be organized.'
      );
    }
    throw new OrganizerServiceError(
      code,
      'The selected file is not a valid PDF.'
    );
  }
};

const hasSignatureFields = (document: PDFDocument): boolean => {
  try {
    return document
      .getForm()
      .getFields()
      .some((field) => field instanceof PDFSignature);
  } catch {
    return false;
  }
};

export const inspectOrganizerPdf = async (
  source: ArrayBuffer | Uint8Array,
  onProgress?: ProgressCallback,
  signal?: AbortSignal
): Promise<OrganizerInspection> => {
  assertNotAborted(signal);
  report(onProgress, 'reading', 0, 1);
  const document = await loadPdf(source, 'INVALID_PDF');
  assertNotAborted(signal);
  report(onProgress, 'reading', 1, 1);

  const sourcePages = document.getPages();
  if (sourcePages.length === 0) {
    throw new OrganizerServiceError(
      'EMPTY_DOCUMENT',
      'The PDF does not contain any pages.'
    );
  }

  const pages = sourcePages.map((page, sourceIndex) => {
    assertNotAborted(signal);
    const size = page.getSize();
    report(onProgress, 'inspecting', sourceIndex + 1, sourcePages.length);
    return {
      id: `source-${sourceIndex + 1}`,
      kind: 'source' as const,
      sourceIndex,
      sourcePageNumber: sourceIndex + 1,
      width: size.width,
      height: size.height,
      rotation: page.getRotation().angle
    };
  });

  return {
    pages,
    pageCount: pages.length,
    hasSignatureFields: hasSignatureFields(document)
  };
};

const closeEnough = (left: number, right: number): boolean =>
  Math.abs(left - right) <= 0.01;

export const createOrganizerSequence = (
  pages: readonly OrganizerPage[]
): string[] =>
  pages.map((page) =>
    page.kind === 'source'
      ? `source:${page.sourcePageNumber}`
      : `blank:${page.id}`
  );

const validateOrganization = (
  pages: readonly OrganizerPage[],
  sourcePageCount: number
) => {
  if (pages.length === 0) {
    throw new OrganizerServiceError(
      'INVALID_ORGANIZATION',
      'At least one page must remain in the output PDF.'
    );
  }
  if (new Set(pages.map((page) => page.id)).size !== pages.length) {
    throw new OrganizerServiceError(
      'INVALID_ORGANIZATION',
      'The page organization contains duplicate internal page identifiers.'
    );
  }
  if (
    pages.some(
      (page) =>
        page.width <= 0 ||
        page.height <= 0 ||
        (page.kind === 'source' &&
          (page.sourceIndex < 0 || page.sourceIndex >= sourcePageCount))
    )
  ) {
    throw new OrganizerServiceError(
      'INVALID_ORGANIZATION',
      'The requested page organization is invalid for this PDF.'
    );
  }
};

export const exportOrganizedPdf = async (
  source: ArrayBuffer | Uint8Array,
  pages: readonly OrganizerPage[],
  onProgress?: ProgressCallback,
  signal?: AbortSignal
): Promise<OrganizerExportResult> => {
  assertNotAborted(signal);
  report(onProgress, 'reading', 0, 1);
  const sourceDocument = await loadPdf(source, 'EXPORT_FAILED');
  report(onProgress, 'reading', 1, 1);
  validateOrganization(pages, sourceDocument.getPageCount());

  const outputDocument = await PDFDocument.create();

  for (let index = 0; index < pages.length; index += 1) {
    assertNotAborted(signal);
    const pageModel = pages[index];

    if (pageModel.kind === 'source') {
      const [copiedPage] = await outputDocument.copyPages(sourceDocument, [
        pageModel.sourceIndex
      ]);
      const copiedSize = copiedPage.getSize();
      if (
        !closeEnough(copiedSize.width, pageModel.width) ||
        !closeEnough(copiedSize.height, pageModel.height) ||
        copiedPage.getRotation().angle !== pageModel.rotation
      ) {
        throw new OrganizerServiceError(
          'VERIFICATION_FAILED',
          `Page ${index + 1} did not preserve its original geometry.`
        );
      }
      outputDocument.addPage(copiedPage);
    } else {
      const blankPage = outputDocument.addPage([
        pageModel.width,
        pageModel.height
      ]);
      blankPage.setRotation(degrees(pageModel.rotation));
    }

    report(onProgress, 'copying', index + 1, pages.length);
  }

  assertNotAborted(signal);
  report(onProgress, 'saving', 0, 1);
  const outputBytes = await outputDocument.save();
  report(onProgress, 'saving', 1, 1);

  assertNotAborted(signal);
  report(onProgress, 'verifying', 0, pages.length);
  const reopened = await PDFDocument.load(outputBytes, {
    updateMetadata: false
  });
  if (reopened.getPageCount() !== pages.length) {
    throw new OrganizerServiceError(
      'VERIFICATION_FAILED',
      'The exported PDF page count does not match the requested organization.'
    );
  }

  const reopenedPages = reopened.getPages();
  for (let index = 0; index < pages.length; index += 1) {
    assertNotAborted(signal);
    const actualPage = reopenedPages[index];
    const expectedPage = pages[index];
    const actualSize = actualPage.getSize();
    if (
      !closeEnough(actualSize.width, expectedPage.width) ||
      !closeEnough(actualSize.height, expectedPage.height) ||
      actualPage.getRotation().angle !== expectedPage.rotation
    ) {
      throw new OrganizerServiceError(
        'VERIFICATION_FAILED',
        `Export verification failed at page ${index + 1}.`
      );
    }
    report(onProgress, 'verifying', index + 1, pages.length);
  }

  const exactBuffer = outputBytes.buffer.slice(
    outputBytes.byteOffset,
    outputBytes.byteOffset + outputBytes.byteLength
  ) as ArrayBuffer;

  return {
    bytes: exactBuffer,
    verification: {
      pageCount: reopened.getPageCount(),
      expectedPageCount: pages.length,
      geometryVerified: true,
      sequence: createOrganizerSequence(pages)
    }
  };
};

export const createOrganizedFileName = (sourceName: string): string => {
  const baseName = sourceName.replace(/\.pdf$/i, '') || 'document';
  return `${baseName}-organized.pdf`;
};
