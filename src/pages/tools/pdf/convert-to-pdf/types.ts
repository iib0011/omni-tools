export type Orientation = 'portrait' | 'landscape';
export type PageType = 'a4' | 'full';

export interface ImageSize {
  widthMm: number;
  heightMm: number;
  widthPx: number;
  heightPx: number;
}

export interface InitialValuesType {
  pageType: PageType;
  orientation: Orientation;
  scale: number;
}

export interface LoadedImage {
  image: HTMLImageElement;
  objectUrl: string;
  format: 'PNG' | 'JPEG';
  filename: string;
}
