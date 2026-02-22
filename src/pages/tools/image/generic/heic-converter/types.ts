export type InitialValuesType = {
  outputFormat: 'jpg' | 'png' | 'webp';
  quality: number;
  preserveMetadata: boolean;
  resizeMode: 'none' | 'width' | 'height' | 'both';
  resizeValue: number;
};

export type ConversionResult = {
  file: File;
  originalSize: number;
  convertedSize: number;
  format: string;
};
