export type PdfPageFormat = 'a4' | 'letter';
export type PdfOrientation = 'portrait' | 'landscape';

export interface InitialValuesType {
  pageFormat: PdfPageFormat;
  orientation: PdfOrientation;
  fontScale: number;
  generationNonce: number;
}

export interface MarkdownAnalysis {
  charCount: number;
  lineCount: number;
  headingCount: number;
  codeBlockCount: number;
  estimatedPages: number;
  estimatedChunkCount: number;
  requiresManualGeneration: boolean;
  exceedsSupportedSize: boolean;
}

export interface MarkdownPdfRenderOptions
  extends Omit<InitialValuesType, 'generationNonce'> {
  sourceName?: string | null;
}
