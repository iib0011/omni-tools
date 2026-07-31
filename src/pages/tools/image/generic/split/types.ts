import { PageSizes } from 'pdf-lib';

export type InitialValuesType = {
  pageFormat: keyof typeof PageSizes;
  widthOfEachPart?: number;
  heightOfEachPart?: number;
  pageWidth: number;
  pageHeight: number;
  pxPerSquareQuantity: number;
  squareQuantity: number;
  unitsPerOneSquare: number;
  unitKind: units;
  padding: number;
};

export type units = 'pt' | 'mm' | 'in';
