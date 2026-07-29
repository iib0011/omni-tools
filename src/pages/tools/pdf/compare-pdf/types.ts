export const COMPARISON_REPORT_VERSION = 1 as const;

export type ComparisonStage =
  | 'loading'
  | 'reading-metadata'
  | 'rendering'
  | 'comparing-visuals'
  | 'extracting-text'
  | 'finalizing';

export interface ComparisonProgress {
  stage: ComparisonStage;
  currentPage: number | null;
  completedPages: number;
  totalPages: number;
  percent: number;
}

export interface PageGeometry {
  widthPoints: number;
  heightPoints: number;
  rotation: number;
}

export interface ComparedDocument {
  fileName: string;
  byteSize: number;
  pageCount: number;
  metadata: Record<string, string>;
}

export interface MetadataDifference {
  field: string;
  documentA: string | null;
  documentB: string | null;
}

export type PagePresence = 'both' | 'missing-from-a' | 'missing-from-b';

export type TextComparisonStatus =
  | 'identical'
  | 'changed'
  | 'no-text-layer'
  | 'only-a-has-text'
  | 'only-b-has-text'
  | 'comparison-limited';

export type TextDiffSegmentKind = 'unchanged' | 'added' | 'removed';

export interface TextDiffSegment {
  kind: TextDiffSegmentKind;
  value: string;
}

export interface TextComparison {
  status: TextComparisonStatus;
  characterCountA: number;
  characterCountB: number;
  changedPercentage: number | null;
  segments: TextDiffSegment[];
}

export interface VisualComparison {
  changedPixels: number;
  totalPixels: number;
  changedPercentage: number;
  tolerance: number;
}

export interface PageComparison {
  pageNumber: number;
  presence: PagePresence;
  documentA: PageGeometry | null;
  documentB: PageGeometry | null;
  dimensionsDiffer: boolean;
  rotationDiffers: boolean;
  visual: VisualComparison;
  text: TextComparison;
  differenceScore: number;
}

export interface ComparisonSummary {
  comparedPages: number;
  identicalPages: number;
  changedPages: number;
  pagesMissingFromA: number;
  pagesMissingFromB: number;
  metadataDifferenceCount: number;
  highestChangedPixelPercentage: number;
  rankedPageNumbers: number[];
  documentsIdentical: boolean;
}

export interface ComparisonReport {
  reportVersion: typeof COMPARISON_REPORT_VERSION;
  generatedAt: string;
  tolerance: number;
  documentA: ComparedDocument;
  documentB: ComparedDocument;
  metadataDifferences: MetadataDifference[];
  summary: ComparisonSummary;
  pages: PageComparison[];
}

export interface PageVisualAssets {
  pageNumber: number;
  documentAUrl: string | null;
  documentBUrl: string | null;
  differenceMaskUrl: string;
  normalizedWidth: number;
  normalizedHeight: number;
}

export interface ComparisonResult {
  report: ComparisonReport;
  visualAssets: Map<number, PageVisualAssets>;
  objectUrls: string[];
}

export interface ExportedPageComparison extends PageComparison {
  reviewed: boolean;
}

export interface ExportedComparisonReport
  extends Omit<ComparisonReport, 'pages'> {
  reviewedPageNumbers: number[];
  pages: ExportedPageComparison[];
}

export type VisualDiffErrorCode =
  | 'invalid-request'
  | 'invalid-pixel-buffer'
  | 'cancelled'
  | 'worker-failure';

export interface VisualDiffCompareRequest {
  type: 'compare';
  requestId: string;
  pageNumber: number;
  width: number;
  height: number;
  tolerance: number;
  pixelsA: ArrayBuffer;
  pixelsB: ArrayBuffer;
}

export interface VisualDiffCancelRequest {
  type: 'cancel';
  requestId: string;
}

export type VisualDiffRequest =
  | VisualDiffCompareRequest
  | VisualDiffCancelRequest;

export interface VisualDiffProgressResponse {
  type: 'progress';
  requestId: string;
  pageNumber: number;
  completedRows: number;
  totalRows: number;
  percent: number;
}

export interface VisualDiffResultResponse {
  type: 'result';
  requestId: string;
  pageNumber: number;
  changedPixels: number;
  totalPixels: number;
  changedPercentage: number;
  differenceMask: ArrayBuffer;
}

export interface VisualDiffErrorResponse {
  type: 'error';
  requestId: string;
  pageNumber: number | null;
  error: {
    code: VisualDiffErrorCode;
    message: string;
  };
}

export interface VisualDiffCancelledResponse {
  type: 'cancelled';
  requestId: string;
  pageNumber: number | null;
}

export type VisualDiffResponse =
  | VisualDiffProgressResponse
  | VisualDiffResultResponse
  | VisualDiffErrorResponse
  | VisualDiffCancelledResponse;

export interface VisualDiffResult {
  pageNumber: number;
  changedPixels: number;
  totalPixels: number;
  changedPercentage: number;
  differenceMask: ArrayBuffer;
}

export interface ComparePdfOptions {
  tolerance: number;
  signal: AbortSignal;
  onProgress?: (progress: ComparisonProgress) => void;
}
