import {
  AnnotationType,
  GlobalWorkerOptions,
  OPS,
  PasswordResponses,
  PermissionFlag,
  getDocument,
  version as pdfJsVersion,
  type PDFDocumentLoadingTask,
  type PDFDocumentProxy,
  type PDFPageProxy
} from 'pdfjs-dist';
import pdfJsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  LOW_TEXT_CHARACTER_THRESHOLD,
  normalizeInspectorReport
} from './normalize-report';
import { RawScanHandle, startRawPdfScan } from './raw-scan-client';
import {
  AttachmentInspection,
  FormInspection,
  InspectPdfError,
  InspectionProgress,
  InspectorEvidence,
  InspectorReport,
  JavaScriptInspection,
  JsonValue,
  PageAction,
  PageInspection,
  PageLink,
  PermissionReport
} from './types';

GlobalWorkerOptions.workerSrc = pdfJsWorkerUrl;

const IMAGE_OPERATORS = new Set<number>([
  OPS.paintImageMaskXObject,
  OPS.paintImageMaskXObjectGroup,
  OPS.paintImageXObject,
  OPS.paintInlineImageXObject,
  OPS.paintInlineImageXObjectGroup,
  OPS.paintImageXObjectRepeat,
  OPS.paintImageMaskXObjectRepeat,
  OPS.paintSolidColorImageMask
]);

const PERMISSIONS: Array<
  [number, NonNullable<PermissionReport['allowed']>[number]]
> = [
  [PermissionFlag.PRINT, 'print'],
  [PermissionFlag.MODIFY_CONTENTS, 'modify-contents'],
  [PermissionFlag.COPY, 'copy'],
  [PermissionFlag.MODIFY_ANNOTATIONS, 'modify-annotations'],
  [PermissionFlag.FILL_INTERACTIVE_FORMS, 'fill-forms'],
  [PermissionFlag.COPY_FOR_ACCESSIBILITY, 'accessibility-copy'],
  [PermissionFlag.ASSEMBLE, 'assemble'],
  [PermissionFlag.PRINT_HIGH_QUALITY, 'high-quality-print']
];

const ANNOTATION_TYPES = new Map<number, string>(
  Object.entries(AnnotationType)
    .filter((entry): entry is [string, number] => typeof entry[1] === 'number')
    .map(([name, value]) => [value, name.toLowerCase().replaceAll('_', '-')])
);

interface PageExtraction {
  page: PageInspection;
  attachments: AttachmentInspection[];
  javascript: JavaScriptInspection[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return null;
}

function asFiniteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function asBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function toJsonValue(value: unknown, depth = 0): JsonValue {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean'
  ) {
    return value;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : String(value);
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (value instanceof Uint8Array || value instanceof ArrayBuffer) {
    const byteLength =
      value instanceof Uint8Array ? value.byteLength : value.byteLength;
    return `[binary data omitted: ${byteLength} bytes]`;
  }
  if (depth >= 5) {
    return '[nested value omitted]';
  }
  if (Array.isArray(value)) {
    return value.map((item) => toJsonValue(item, depth + 1));
  }
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        toJsonValue(item, depth + 1)
      ])
    );
  }
  return String(value);
}

function normalizeRecord(value: unknown): Record<string, JsonValue> {
  if (!isRecord(value)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(value)
      .map(([key, item]) => [key, toJsonValue(item)] as const)
      .sort(([left], [right]) => left.localeCompare(right))
  );
}

function throwIfCancelled(signal: AbortSignal): void {
  if (signal.aborted) {
    throw new InspectPdfError('cancelled', 'PDF inspection was cancelled.');
  }
}

function isAbortLike(error: unknown, signal: AbortSignal): boolean {
  return (
    signal.aborted ||
    (error instanceof Error &&
      (error.name === 'AbortError' ||
        error.name === 'AbortException' ||
        error.name === 'RenderingCancelledException'))
  );
}

async function safelyInspect<T>(
  label: string,
  operation: () => Promise<T>,
  fallback: T,
  uncertainties: string[],
  signal: AbortSignal
): Promise<T> {
  throwIfCancelled(signal);
  try {
    const result = await operation();
    throwIfCancelled(signal);
    return result;
  } catch (error) {
    if (isAbortLike(error, signal)) {
      throw new InspectPdfError('cancelled', 'PDF inspection was cancelled.');
    }
    uncertainties.push(
      `${label} could not be inspected: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return fallback;
  }
}

function requestId(): string {
  return globalThis.crypto.randomUUID();
}

function normalizeRotation(rotation: number): number {
  return ((Math.round(rotation) % 360) + 360) % 360;
}

function orientation(
  width: number,
  height: number
): PageInspection['orientation'] {
  if (Math.abs(width - height) < 0.01) {
    return 'square';
  }
  return width > height ? 'landscape' : 'portrait';
}

function roundedPoints(value: number): number {
  return Math.round(value * 100) / 100;
}

function isExternalTarget(target: string): boolean {
  if (target.startsWith('#')) {
    return false;
  }
  return /^[a-z][a-z\d+.-]*:/i.test(target);
}

function readByteSize(value: unknown): number | null {
  if (value instanceof Uint8Array || value instanceof ArrayBuffer) {
    return value.byteLength;
  }
  return null;
}

function annotationTypeName(value: unknown): string {
  const numericType = asFiniteNumber(value);
  return numericType === null
    ? 'unknown'
    : ANNOTATION_TYPES.get(numericType) ?? `type-${numericType}`;
}

function addAction(
  actions: PageAction[],
  pageNumber: number | null,
  type: string,
  source: PageAction['source']
): void {
  if (!type.trim()) {
    return;
  }
  if (
    !actions.some(
      (item) =>
        item.pageNumber === pageNumber &&
        item.type === type &&
        item.source === source
    )
  ) {
    actions.push({ pageNumber, type, source });
  }
}

function actionNames(value: unknown): string[] {
  if (!isRecord(value)) {
    return [];
  }
  return Object.keys(value).sort((left, right) => left.localeCompare(right));
}

function scriptSummary(
  value: unknown,
  scope: JavaScriptInspection['scope'],
  pageNumber: number | null
): JavaScriptInspection[] {
  if (!isRecord(value)) {
    return [];
  }

  return Object.entries(value)
    .map(([event, scripts]) => {
      const values = Array.isArray(scripts) ? scripts : [scripts];
      const sourceStrings = values.filter(
        (item): item is string => typeof item === 'string'
      );
      return {
        scope,
        pageNumber,
        event,
        scriptCount: sourceStrings.length,
        totalCharacters: sourceStrings.reduce(
          (sum, script) => sum + script.length,
          0
        )
      };
    })
    .filter((item) => item.scriptCount > 0)
    .sort((left, right) => left.event.localeCompare(right.event));
}

function extractForms(fieldObjects: unknown): FormInspection[] {
  if (!isRecord(fieldObjects)) {
    return [];
  }

  return Object.entries(fieldObjects)
    .map(([name, rawWidgets]) => {
      const widgets = Array.isArray(rawWidgets)
        ? rawWidgets.filter(isRecord)
        : [];
      const types = widgets
        .map((widget) => asString(widget.type))
        .filter((value): value is string => Boolean(value));
      const pages = widgets
        .map((widget) => asFiniteNumber(widget.page))
        .filter((value): value is number => value !== null && value >= 0)
        .map((pageIndex) => pageIndex + 1);

      return {
        name,
        type: types[0] ?? 'unknown',
        widgetCount: widgets.length,
        pageNumbers: Array.from(new Set(pages)).sort(
          (left, right) => left - right
        ),
        hasActions: widgets.some(
          (widget) =>
            isRecord(widget.actions) && Object.keys(widget.actions).length > 0
        )
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

function extractAttachments(
  attachments: unknown,
  source: AttachmentInspection['source'],
  pageNumber: number | null
): AttachmentInspection[] {
  if (!isRecord(attachments)) {
    return [];
  }

  return Object.entries(attachments)
    .map(([key, rawAttachment]) => {
      const attachment = isRecord(rawAttachment) ? rawAttachment : {};
      return {
        name:
          asString(attachment.filename) ??
          asString(attachment.rawFilename) ??
          key,
        byteSize: readByteSize(attachment.content),
        description: asString(attachment.description),
        source,
        pageNumber
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

function uniqueAttachments(
  attachments: AttachmentInspection[]
): AttachmentInspection[] {
  const seen = new Set<string>();
  return attachments.filter((attachment) => {
    const key = `${attachment.source}:${attachment.pageNumber ?? 'document'}:${
      attachment.name
    }:${attachment.byteSize ?? 'unknown'}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function outlineLinks(outline: unknown): PageLink[] {
  const links: PageLink[] = [];

  const visit = (items: unknown): void => {
    if (!Array.isArray(items)) {
      return;
    }
    for (const item of items) {
      if (!isRecord(item)) {
        continue;
      }
      const target = asString(item.url) ?? asString(item.unsafeUrl);
      if (target) {
        links.push({
          pageNumber: null,
          target,
          external: isExternalTarget(target),
          source: 'outline'
        });
      }
      visit(item.items);
    }
  };

  visit(outline);
  return links;
}

function permissionReport(permissions: number[] | null): PermissionReport {
  if (!permissions) {
    return {
      exposed: false,
      rawFlags: null,
      allowed: null,
      note: 'PDF.js did not expose permission flags. This does not establish that the document is unencrypted or unrestricted.'
    };
  }

  return {
    exposed: true,
    rawFlags: [...permissions].sort((left, right) => left - right),
    allowed: PERMISSIONS.filter(([flag]) => permissions.includes(flag)).map(
      ([, name]) => name
    ),
    note: 'These are viewer permission flags exposed by PDF.js, not an enforcement or rights-management determination.'
  };
}

async function inspectPage(
  page: PDFPageProxy,
  pageNumber: number,
  totalPages: number,
  signal: AbortSignal,
  uncertainties: string[],
  onProgress?: (progress: InspectionProgress) => void
): Promise<PageExtraction> {
  throwIfCancelled(signal);
  onProgress?.({
    stage: 'pages',
    completed: pageNumber - 1,
    total: totalPages,
    pageNumber,
    totalPages
  });

  try {
    const [textContent, annotations, operatorList, pageJavaScript] =
      await Promise.all([
        safelyInspect(
          `Page ${pageNumber} text`,
          () => page.getTextContent(),
          null,
          uncertainties,
          signal
        ),
        safelyInspect(
          `Page ${pageNumber} annotations`,
          () => page.getAnnotations({ intent: 'any' }),
          [],
          uncertainties,
          signal
        ),
        safelyInspect(
          `Page ${pageNumber} resources`,
          () => page.getOperatorList({ intent: 'any' }),
          null,
          uncertainties,
          signal
        ),
        safelyInspect(
          `Page ${pageNumber} actions`,
          () => page.getJSActions(),
          {},
          uncertainties,
          signal
        )
      ]);

    throwIfCancelled(signal);

    const rotation = normalizeRotation(page.rotate);
    const userUnit = Number.isFinite(page.userUnit) ? page.userUnit : 1;
    const width = Math.abs(page.view[2] - page.view[0]) * userUnit;
    const height = Math.abs(page.view[3] - page.view[1]) * userUnit;
    const swapsDimensions = rotation === 90 || rotation === 270;
    const displayedWidth = swapsDimensions ? height : width;
    const displayedHeight = swapsDimensions ? width : height;
    const strings = textContent
      ? textContent.items
          .filter(
            (
              item
            ): item is (typeof textContent.items)[number] & {
              str: string;
            } => 'str' in item && typeof item.str === 'string'
          )
          .map((item) => item.str)
      : [];
    const extractableTextCharacters = strings.join('').length;
    const fontNames = new Set<string>();
    if (textContent) {
      for (const item of textContent.items) {
        if ('fontName' in item && typeof item.fontName === 'string') {
          fontNames.add(item.fontName);
        }
      }
      for (const style of Object.values(textContent.styles)) {
        if (style.fontFamily) {
          fontNames.add(style.fontFamily);
        }
      }
    }

    const annotationsByType: Record<string, number> = {};
    const links: PageLink[] = [];
    const actions: PageAction[] = [];
    const attachments: AttachmentInspection[] = [];
    for (const rawAnnotation of annotations) {
      const annotation = isRecord(rawAnnotation) ? rawAnnotation : {};
      const typeName = annotationTypeName(annotation.annotationType);
      annotationsByType[typeName] = (annotationsByType[typeName] ?? 0) + 1;

      const target = asString(annotation.url) ?? asString(annotation.unsafeUrl);
      if (target) {
        links.push({
          pageNumber,
          target,
          external: isExternalTarget(target),
          source: 'annotation'
        });
      }

      const namedAction = asString(annotation.action);
      if (namedAction) {
        addAction(actions, pageNumber, namedAction, 'annotation');
      }
      for (const eventName of actionNames(annotation.actions)) {
        addAction(
          actions,
          pageNumber,
          `additional-action:${eventName}`,
          'annotation'
        );
      }

      if (typeName === 'fileattachment' && isRecord(annotation.file)) {
        attachments.push(
          ...extractAttachments(
            {
              [asString(annotation.file.filename) ?? 'attachment']:
                annotation.file
            },
            'annotation',
            pageNumber
          )
        );
      }
    }

    const pageScriptSummary = scriptSummary(pageJavaScript, 'page', pageNumber);
    for (const item of pageScriptSummary) {
      addAction(actions, pageNumber, `javascript:${item.event}`, 'page');
    }

    const imagePaintOperations =
      operatorList?.fnArray.filter((operator) => IMAGE_OPERATORS.has(operator))
        .length ?? 0;

    return {
      page: {
        pageNumber,
        widthPoints: roundedPoints(width),
        heightPoints: roundedPoints(height),
        displayedWidthPoints: roundedPoints(displayedWidth),
        displayedHeightPoints: roundedPoints(displayedHeight),
        orientation: orientation(displayedWidth, displayedHeight),
        rotation,
        extractableTextCharacters,
        lowExtractableText:
          extractableTextCharacters < LOW_TEXT_CHARACTER_THRESHOLD,
        annotationCount: annotations.length,
        annotationsByType: Object.fromEntries(
          Object.entries(annotationsByType).sort(([left], [right]) =>
            left.localeCompare(right)
          )
        ),
        links,
        actions,
        imagePaintOperations,
        approximateFontNames: Array.from(fontNames).sort((left, right) =>
          left.localeCompare(right)
        ),
        resourceNote:
          'Image counts are paint operations; font names are limited to parsed text styles.'
      },
      attachments,
      javascript: pageScriptSummary
    };
  } finally {
    page.cleanup();
  }
}

async function loadPdfDocument(
  bytes: ArrayBuffer,
  password: string | undefined,
  signal: AbortSignal
): Promise<{
  document: PDFDocumentProxy;
  loadingTask: PDFDocumentLoadingTask;
  passwordRequired: boolean;
}> {
  throwIfCancelled(signal);
  const loadingTask = getDocument({
    data: bytes,
    cMapUrl: `${
      import.meta.env.BASE_URL.endsWith('/')
        ? import.meta.env.BASE_URL
        : `${import.meta.env.BASE_URL}/`
    }pdf-workbench/runtime/pdfjs/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${
      import.meta.env.BASE_URL.endsWith('/')
        ? import.meta.env.BASE_URL
        : `${import.meta.env.BASE_URL}/`
    }pdf-workbench/runtime/pdfjs/standard_fonts/`,
    isEvalSupported: false,
    useSystemFonts: false,
    useWasm: false,
    enableXfa: false,
    stopAtErrors: false,
    disableAutoFetch: true,
    disableStream: true
  });
  let passwordRequired = false;
  let rejectPassword: ((error: InspectPdfError) => void) | undefined;
  const passwordFailure = new Promise<never>((_, reject) => {
    rejectPassword = reject;
  });

  loadingTask.onPassword = (
    updatePassword: (nextPassword: string) => void,
    reason: number
  ) => {
    passwordRequired = true;
    if (signal.aborted) {
      rejectPassword?.(
        new InspectPdfError('cancelled', 'PDF inspection was cancelled.')
      );
      return;
    }
    if (
      reason === PasswordResponses.NEED_PASSWORD &&
      password &&
      password.length > 0
    ) {
      updatePassword(password);
      return;
    }
    if (reason === PasswordResponses.INCORRECT_PASSWORD) {
      rejectPassword?.(
        new InspectPdfError(
          'incorrect-password',
          'The supplied PDF password is incorrect.'
        )
      );
      return;
    }
    rejectPassword?.(
      new InspectPdfError(
        'password-required',
        'This PDF requires a password before its contents can be inspected.'
      )
    );
  };

  const abortLoading = (): void => {
    void loadingTask.destroy();
  };
  signal.addEventListener('abort', abortLoading, { once: true });

  try {
    const document = await Promise.race([loadingTask.promise, passwordFailure]);
    throwIfCancelled(signal);
    return { document, loadingTask, passwordRequired };
  } catch (error) {
    await loadingTask.destroy();
    if (error instanceof InspectPdfError) {
      throw error;
    }
    if (isAbortLike(error, signal)) {
      throw new InspectPdfError('cancelled', 'PDF inspection was cancelled.');
    }
    const message = error instanceof Error ? error.message : String(error);
    if (
      error instanceof Error &&
      (error.name === 'InvalidPDFException' ||
        /invalid pdf|malformed pdf|invalid xref|invalid trailer/i.test(message))
    ) {
      throw new InspectPdfError(
        'malformed-pdf',
        'The file could not be parsed as a valid PDF.',
        message
      );
    }
    throw new InspectPdfError(
      'inspection-failed',
      'PDF.js could not open this document.',
      message
    );
  } finally {
    signal.removeEventListener('abort', abortLoading);
  }
}

export interface InspectPdfOptions {
  password?: string;
  signal: AbortSignal;
  onProgress?: (progress: InspectionProgress) => void;
  now?: () => Date;
}

export interface InspectPdfDependencies {
  startRawScan: (
    bytes: ArrayBuffer,
    requestId: string,
    onProgress?: (progress: InspectionProgress) => void
  ) => RawScanHandle;
}

export async function inspectPdf(
  file: File,
  { password, signal, onProgress, now = () => new Date() }: InspectPdfOptions,
  dependencies: InspectPdfDependencies = {
    startRawScan: startRawPdfScan
  }
): Promise<InspectorReport> {
  if (file.size === 0) {
    throw new InspectPdfError('empty-file', 'Choose a non-empty PDF file.');
  }

  throwIfCancelled(signal);
  onProgress?.({
    stage: 'reading-file',
    completed: 0,
    total: file.size
  });
  const rawBytes = await file.arrayBuffer();
  throwIfCancelled(signal);

  const rawScanHandle = dependencies.startRawScan(
    rawBytes,
    requestId(),
    onProgress
  );
  const cancelRawScan = (): void => rawScanHandle.cancel();
  signal.addEventListener('abort', cancelRawScan, { once: true });

  let rawScan;
  try {
    rawScan = await rawScanHandle.promise;
  } finally {
    signal.removeEventListener('abort', cancelRawScan);
  }

  if (!rawScan.hasPdfHeader) {
    throw new InspectPdfError(
      'not-pdf',
      'The selected file does not contain a recognizable PDF header.'
    );
  }

  throwIfCancelled(signal);
  onProgress?.({
    stage: 'loading-document',
    completed: 0,
    total: 1
  });
  const pdfBytes = await file.arrayBuffer();
  throwIfCancelled(signal);

  const {
    document: pdfDocument,
    loadingTask,
    passwordRequired
  } = await loadPdfDocument(pdfBytes, password, signal);
  const uncertainties: string[] = [];
  const cancelDocument = (): void => {
    void loadingTask.destroy();
  };
  signal.addEventListener('abort', cancelDocument, { once: true });

  try {
    onProgress?.({
      stage: 'document-properties',
      completed: 0,
      total: 7
    });

    const metadataResult = await safelyInspect(
      'Document metadata',
      () => pdfDocument.getMetadata(),
      null,
      uncertainties,
      signal
    );
    onProgress?.({
      stage: 'document-properties',
      completed: 1,
      total: 7
    });
    const permissions = await safelyInspect(
      'Document permissions',
      () => pdfDocument.getPermissions(),
      null,
      uncertainties,
      signal
    );
    onProgress?.({
      stage: 'document-properties',
      completed: 2,
      total: 7
    });
    const fieldObjects = await safelyInspect(
      'Form fields',
      () => pdfDocument.getFieldObjects(),
      null,
      uncertainties,
      signal
    );
    onProgress?.({
      stage: 'document-properties',
      completed: 3,
      total: 7
    });
    const documentAttachments = await safelyInspect(
      'Embedded attachments',
      () => pdfDocument.getAttachments(),
      null,
      uncertainties,
      signal
    );
    onProgress?.({
      stage: 'document-properties',
      completed: 4,
      total: 7
    });
    const documentJavaScript = await safelyInspect(
      'Document JavaScript',
      () => pdfDocument.getJSActions(),
      null,
      uncertainties,
      signal
    );
    const hasJavaScriptActions = await safelyInspect(
      'JavaScript action status',
      () => pdfDocument.hasJSActions(),
      false,
      uncertainties,
      signal
    );
    onProgress?.({
      stage: 'document-properties',
      completed: 5,
      total: 7
    });
    const openAction = await safelyInspect(
      'Document open action',
      () => pdfDocument.getOpenAction(),
      null,
      uncertainties,
      signal
    );
    onProgress?.({
      stage: 'document-properties',
      completed: 6,
      total: 7
    });
    const outline = await safelyInspect(
      'Document outline links',
      () => pdfDocument.getOutline(),
      [],
      uncertainties,
      signal
    );
    onProgress?.({
      stage: 'document-properties',
      completed: 7,
      total: 7
    });

    let xmpRaw: string | null = null;
    const xmpProperties: Record<string, JsonValue> = {};
    if (metadataResult?.metadata) {
      try {
        xmpRaw = asString(metadataResult.metadata.getRaw());
        for (const entry of metadataResult.metadata) {
          if (
            Array.isArray(entry) &&
            entry.length >= 2 &&
            typeof entry[0] === 'string'
          ) {
            xmpProperties[entry[0]] = toJsonValue(entry[1]);
          }
        }
      } catch (error) {
        uncertainties.push(
          `XMP metadata could not be normalized: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }

    const pages: PageInspection[] = [];
    const pageAttachments: AttachmentInspection[] = [];
    const pageJavaScript: JavaScriptInspection[] = [];
    for (
      let pageNumber = 1;
      pageNumber <= pdfDocument.numPages;
      pageNumber += 1
    ) {
      throwIfCancelled(signal);
      const page = await pdfDocument.getPage(pageNumber);
      const extracted = await inspectPage(
        page,
        pageNumber,
        pdfDocument.numPages,
        signal,
        uncertainties,
        onProgress
      );
      pages.push(extracted.page);
      pageAttachments.push(...extracted.attachments);
      pageJavaScript.push(...extracted.javascript);
      onProgress?.({
        stage: 'pages',
        completed: pageNumber,
        total: pdfDocument.numPages,
        pageNumber,
        totalPages: pdfDocument.numPages
      });
    }

    throwIfCancelled(signal);
    onProgress?.({
      stage: 'finalizing',
      completed: 0,
      total: 1
    });

    const metadata = normalizeRecord(metadataResult?.info);
    const reportedVersion =
      asString(metadata.PDFFormatVersion) ?? rawScan.headerVersion;
    const evidence: InspectorEvidence = {
      generatedAt: now().toISOString(),
      file: {
        name: file.name,
        byteSize: file.size,
        mimeType: file.type || 'application/pdf',
        sha256: rawScan.sha256
      },
      pdfJsVersion,
      raw: rawScan,
      document: {
        pdfVersion: reportedVersion,
        pageCount: pdfDocument.numPages,
        passwordRequired,
        encryptionFilter: asString(metadata.EncryptFilterName),
        parserFlags: {
          isLinearized: asBoolean(metadata.IsLinearized),
          hasAcroForm: asBoolean(metadata.IsAcroFormPresent),
          hasXfa: asBoolean(metadata.IsXFAPresent),
          hasSignatures: asBoolean(metadata.IsSignaturesPresent)
        },
        permissions: permissionReport(permissions),
        metadata,
        xmpRaw,
        xmpProperties: Object.fromEntries(
          Object.entries(xmpProperties).sort(([left], [right]) =>
            left.localeCompare(right)
          )
        ),
        fields: extractForms(fieldObjects),
        attachments: uniqueAttachments([
          ...extractAttachments(documentAttachments, 'document', null),
          ...pageAttachments
        ]),
        javascript: [
          ...scriptSummary(documentJavaScript, 'document', null),
          ...pageJavaScript
        ],
        openActionPresent: openAction !== null,
        outlineLinks: outlineLinks(outline),
        hasJavaScriptActions
      },
      pages,
      uncertainties
    };
    const report = normalizeInspectorReport(evidence);

    onProgress?.({
      stage: 'finalizing',
      completed: 1,
      total: 1
    });
    return report;
  } catch (error) {
    if (error instanceof InspectPdfError) {
      throw error;
    }
    if (isAbortLike(error, signal)) {
      throw new InspectPdfError('cancelled', 'PDF inspection was cancelled.');
    }
    throw new InspectPdfError(
      'inspection-failed',
      'The PDF inspection did not finish.',
      error instanceof Error ? error.message : String(error)
    );
  } finally {
    signal.removeEventListener('abort', cancelDocument);
    await pdfDocument.destroy();
  }
}
