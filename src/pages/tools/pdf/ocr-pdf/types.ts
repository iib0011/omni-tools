export const OCR_LANGUAGES = [
  'eng',
  'fra',
  'deu',
  'spa',
  'ita',
  'por',
  'rus',
  'jpn',
  'chi_sim',
  'chi_tra',
  'kor',
  'ara'
] as const;

export type OcrLanguage = (typeof OCR_LANGUAGES)[number];
export type OcrDpi = 150 | 200 | 300;

export interface OcrOptions {
  pageRange: string;
  language: OcrLanguage;
  dpi: OcrDpi;
  autoOrient: boolean;
  skipTextPages: boolean;
  meaningfulTextThreshold: number;
}

export interface OcrBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface OcrWord {
  text: string;
  confidence: number;
  bbox: OcrBox;
  pdfPlacement?: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  };
}

export interface OcrLine {
  text: string;
  confidence: number;
  bbox: OcrBox;
  words: OcrWord[];
}

export type OcrPageStatus = 'ocr' | 'native' | 'failed';

export interface OcrPageResult {
  pageNumber: number;
  status: OcrPageStatus;
  width: number;
  height: number;
  rotation: number;
  imageWidth: number;
  imageHeight: number;
  text: string;
  lines: OcrLine[];
  words: OcrWord[];
  error?: string;
}

export interface SearchablePdfWorkerPayload {
  pdfBytes: ArrayBuffer;
  pages: OcrPageResult[];
  fontBytes: ArrayBuffer;
}

export interface SearchablePdfWorkerResult {
  bytes: ArrayBuffer;
  pageCount: number;
  textLayerPages: number[];
  unsupportedGlyphs: string[];
}

export interface OcrJsonReport {
  version: 1;
  source: {
    name: string;
    size: number;
    pageCount: number;
  };
  options: OcrOptions;
  pages: OcrPageResult[];
}
