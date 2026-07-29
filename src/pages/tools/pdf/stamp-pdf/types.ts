export type StampMode =
  | 'text'
  | 'image'
  | 'page-numbers'
  | 'bates'
  | 'header-footer';

export type StampLayer = 'above' | 'below';

export type StampPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-center'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface StampOptions {
  mode: StampMode;
  pageRange: string;
  layer: StampLayer;
  position: StampPosition;
  horizontalMargin: number;
  verticalMargin: number;
  opacity: number;
  rotation: number;
  fontSize: number;
  color: string;
  text: string;
  pageNumberFormat: string;
  startingPageNumber: number;
  batesPrefix: string;
  batesSuffix: string;
  batesStart: number;
  batesPadding: number;
  headerText: string;
  footerText: string;
  imageScale: number;
  preserveAspectRatio: boolean;
}

export interface StampWorkerPayload {
  pdfBytes: ArrayBuffer;
  options: StampOptions;
  imageBytes?: ArrayBuffer;
  imageType?: 'image/png' | 'image/jpeg';
  fontBytes?: {
    default?: ArrayBuffer;
    arabic?: ArrayBuffer;
    cjk?: ArrayBuffer;
  };
}

export interface StampWorkerResult {
  bytes: ArrayBuffer;
  pageCount: number;
  stampedPages: number[];
}
