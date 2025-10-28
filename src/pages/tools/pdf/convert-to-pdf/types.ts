export type Orientation = 'portrait' | 'landscape';
export type PageType = 'a4' | 'full';

export interface ImageSize {
  widthMm: number;
  heightMm: number;
  widthPx: number;
  heightPx: number;
}

export interface FormValues {
  pageType: PageType;
  orientation: Orientation;
  scale: number;
}

export const initialValues: FormValues = {
  pageType: 'full',
  orientation: 'portrait',
  scale: 100
};
