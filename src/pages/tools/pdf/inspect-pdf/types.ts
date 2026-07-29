export type FindingCategory =
  | 'informational'
  | 'privacy-related'
  | 'potentially-active';

export type FindingCertainty = 'confirmed' | 'likely' | 'uncertain';

export type InspectorFindingId =
  | 'document-summary'
  | 'document-metadata'
  | 'embedded-attachments'
  | 'external-links'
  | 'javascript'
  | 'open-action'
  | 'other-actions'
  | 'raw-active-markers'
  | 'forms'
  | 'signature-fields'
  | 'xfa-form'
  | 'annotations'
  | 'low-text-pages';

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface InspectionProgress {
  stage:
    | 'reading-file'
    | 'hashing'
    | 'scanning-structure'
    | 'loading-document'
    | 'document-properties'
    | 'pages'
    | 'finalizing';
  completed: number;
  total: number;
  pageNumber?: number;
  totalPages?: number;
}

export interface RawMarkerEvidence {
  kind:
    | 'encryption'
    | 'linearization'
    | 'javascript'
    | 'open-action'
    | 'launch-action'
    | 'additional-actions'
    | 'submit-form'
    | 'import-data'
    | 'remote-document'
    | 'embedded-files'
    | 'signature-field'
    | 'xfa-form';
  detected: boolean;
  firstByteOffset: number | null;
}

export interface RawPdfScan {
  sha256: string;
  hasPdfHeader: boolean;
  headerVersion: string | null;
  headerByteOffset: number | null;
  markers: RawMarkerEvidence[];
  scannedBytes: number;
  notes: string[];
}

export interface PermissionReport {
  exposed: boolean;
  rawFlags: number[] | null;
  allowed: Array<
    | 'print'
    | 'modify-contents'
    | 'copy'
    | 'modify-annotations'
    | 'fill-forms'
    | 'accessibility-copy'
    | 'assemble'
    | 'high-quality-print'
  > | null;
  note: string;
}

export interface PageLink {
  pageNumber: number | null;
  target: string;
  external: boolean;
  source: 'annotation' | 'outline';
}

export interface PageAction {
  pageNumber: number | null;
  type: string;
  source: 'annotation' | 'page' | 'document' | 'raw-marker';
}

export interface PageInspection {
  pageNumber: number;
  widthPoints: number;
  heightPoints: number;
  displayedWidthPoints: number;
  displayedHeightPoints: number;
  orientation: 'portrait' | 'landscape' | 'square';
  rotation: number;
  extractableTextCharacters: number;
  lowExtractableText: boolean;
  annotationCount: number;
  annotationsByType: Record<string, number>;
  links: PageLink[];
  actions: PageAction[];
  imagePaintOperations: number;
  approximateFontNames: string[];
  resourceNote: string;
}

export interface FormInspection {
  name: string;
  type: string;
  widgetCount: number;
  pageNumbers: number[];
  hasActions: boolean;
}

export interface SignatureFieldInspection {
  name: string;
  widgetCount: number;
  pageNumbers: number[];
  note: string;
}

export interface AttachmentInspection {
  name: string;
  byteSize: number | null;
  description: string | null;
  source: 'document' | 'annotation';
  pageNumber: number | null;
}

export interface JavaScriptInspection {
  scope: 'document' | 'page';
  pageNumber: number | null;
  event: string;
  scriptCount: number;
  totalCharacters: number;
}

export interface InspectorFinding {
  id: InspectorFindingId;
  category: FindingCategory;
  certainty: FindingCertainty;
  title: string;
  summary: string;
  evidence: string[];
  pageNumbers?: number[];
}

export interface InspectorEvidence {
  generatedAt: string;
  file: {
    name: string;
    byteSize: number;
    mimeType: string;
    sha256: string;
  };
  pdfJsVersion: string;
  raw: RawPdfScan;
  document: {
    pdfVersion: string | null;
    pageCount: number;
    passwordRequired: boolean;
    encryptionFilter: string | null;
    parserFlags: {
      isLinearized: boolean | null;
      hasAcroForm: boolean | null;
      hasXfa: boolean | null;
      hasSignatures: boolean | null;
    };
    permissions: PermissionReport;
    metadata: Record<string, JsonValue>;
    xmpRaw: string | null;
    xmpProperties: Record<string, JsonValue>;
    fields: FormInspection[];
    attachments: AttachmentInspection[];
    javascript: JavaScriptInspection[];
    openActionPresent: boolean;
    outlineLinks: PageLink[];
    hasJavaScriptActions: boolean;
  };
  pages: PageInspection[];
  uncertainties: string[];
}

export interface InspectorReport {
  schemaVersion: '1.0';
  generatedAt: string;
  scopeStatement: string;
  file: InspectorEvidence['file'];
  parser: {
    name: 'PDF.js';
    version: string;
    rawStructureScan: string;
  };
  document: {
    pdfVersion: string | null;
    pageCount: number;
    passwordRequired: boolean;
    encryption: {
      state: 'detected' | 'not-detected' | 'uncertain';
      filter: string | null;
      evidence: string[];
    };
    linearization: {
      state: 'appears-linearized' | 'not-detected' | 'uncertain';
      evidence: string[];
    };
    permissions: PermissionReport;
  };
  metadata: {
    documentInfo: Record<string, JsonValue>;
    xmp: {
      present: boolean;
      raw: string | null;
      properties: Record<string, JsonValue>;
    };
  };
  pages: PageInspection[];
  text: {
    totalExtractableCharacters: number;
    lowTextThreshold: number;
    lowTextPages: number[];
    note: string;
  };
  forms: {
    fields: FormInspection[];
    signatureFields: SignatureFieldInspection[];
    parserFlags: InspectorEvidence['document']['parserFlags'];
  };
  annotations: {
    total: number;
    byType: Record<string, number>;
  };
  links: {
    all: PageLink[];
    externalTargets: PageLink[];
    note: string;
  };
  attachments: AttachmentInspection[];
  activeContent: {
    javascript: JavaScriptInspection[];
    openActionPresent: boolean;
    actionTypes: PageAction[];
    rawMarkers: RawMarkerEvidence[];
    note: string;
  };
  resources: {
    imagePaintOperations: number;
    approximateFontNames: string[];
    note: string;
  };
  findings: InspectorFinding[];
  findingsByCategory: Record<FindingCategory, InspectorFinding[]>;
  uncertainties: string[];
}

export type InspectPdfErrorCode =
  | 'cancelled'
  | 'empty-file'
  | 'not-pdf'
  | 'password-required'
  | 'incorrect-password'
  | 'malformed-pdf'
  | 'worker-error'
  | 'inspection-failed';

export class InspectPdfError extends Error {
  constructor(
    public readonly code: InspectPdfErrorCode,
    message: string,
    public readonly details?: string
  ) {
    super(message);
    this.name = 'InspectPdfError';
  }
}
