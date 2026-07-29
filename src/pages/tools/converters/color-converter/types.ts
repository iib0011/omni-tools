export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface HslColor {
  h: number;
  s: number;
  l: number;
}

export interface HsvColor {
  h: number;
  s: number;
  v: number;
}

export interface OklchColor {
  l: number;
  c: number;
  h: number;
}

export interface ColorFormats {
  hex: string;
  rgb: RgbColor;
  hsl: HslColor;
  hsv: HsvColor;
  oklch: OklchColor;
}

export interface ComplementaryColor {
  hex: string;
  hsl: HslColor;
}

export interface WcagResult {
  ratio: number;
  onWhite: 'AAA' | 'AA' | 'AA Large' | 'Fail';
  onBlack: 'AAA' | 'AA' | 'AA Large' | 'Fail';
}

export interface ExportSnippets {
  css: string;
  tailwind: string;
  scss: string;
}

export interface InitialValuesType {
  exportName: string;
}
