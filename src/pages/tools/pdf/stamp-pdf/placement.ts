import type { PDFImage, PDFFont } from 'pdf-lib';
import type { StampPosition } from './types';

export interface PlacementInput {
  pageWidth: number;
  pageHeight: number;
  contentWidth: number;
  contentHeight: number;
  position: StampPosition;
  horizontalMargin: number;
  verticalMargin: number;
}

export interface PageAwarePlacementInput extends PlacementInput {
  pageRotation: number;
  contentRotation: number;
}

export interface PageAwarePlacement {
  x: number;
  y: number;
  rotation: number;
  visualPageWidth: number;
  visualPageHeight: number;
}

export function calculatePlacement({
  pageWidth,
  pageHeight,
  contentWidth,
  contentHeight,
  position,
  horizontalMargin,
  verticalMargin
}: PlacementInput): { x: number; y: number } {
  const [vertical, horizontal] = position.split('-') as [
    'top' | 'middle' | 'bottom',
    'left' | 'center' | 'right'
  ];
  const x =
    horizontal === 'left'
      ? horizontalMargin
      : horizontal === 'right'
        ? pageWidth - contentWidth - horizontalMargin
        : (pageWidth - contentWidth) / 2;
  const y =
    vertical === 'bottom'
      ? verticalMargin
      : vertical === 'top'
        ? pageHeight - contentHeight - verticalMargin
        : (pageHeight - contentHeight) / 2;
  return { x: Math.max(0, x), y: Math.max(0, y) };
}

export function normalizePageRotation(rotation: number): 0 | 90 | 180 | 270 {
  const normalized = ((Math.round(rotation) % 360) + 360) % 360;
  if (
    normalized === 0 ||
    normalized === 90 ||
    normalized === 180 ||
    normalized === 270
  ) {
    return normalized;
  }
  throw new Error('PDF page rotation must be a multiple of 90 degrees.');
}

export function calculatePageAwarePlacement({
  pageWidth,
  pageHeight,
  pageRotation,
  contentWidth,
  contentHeight,
  contentRotation,
  position,
  horizontalMargin,
  verticalMargin
}: PageAwarePlacementInput): PageAwarePlacement {
  const rotation = normalizePageRotation(pageRotation);
  const swapsAxes = rotation === 90 || rotation === 270;
  const visualPageWidth = swapsAxes ? pageHeight : pageWidth;
  const visualPageHeight = swapsAxes ? pageWidth : pageHeight;
  const visual = calculatePlacement({
    pageWidth: visualPageWidth,
    pageHeight: visualPageHeight,
    contentWidth,
    contentHeight,
    position,
    horizontalMargin,
    verticalMargin
  });

  const raw =
    rotation === 0
      ? { x: visual.x, y: visual.y }
      : rotation === 90
        ? { x: pageWidth - visual.y, y: visual.x }
        : rotation === 180
          ? { x: pageWidth - visual.x, y: pageHeight - visual.y }
          : { x: visual.y, y: pageHeight - visual.x };

  return {
    ...raw,
    rotation: contentRotation + rotation,
    visualPageWidth,
    visualPageHeight
  };
}

export function textDimensions(
  font: PDFFont,
  text: string,
  fontSize: number
): { width: number; height: number } {
  return {
    width: font.widthOfTextAtSize(text, fontSize),
    height: font.heightAtSize(fontSize)
  };
}

export function imageDimensions(
  image: PDFImage,
  scalePercent: number,
  preserveAspectRatio: boolean
): { width: number; height: number } {
  const scale = Math.max(0.01, scalePercent / 100);
  if (preserveAspectRatio) {
    const dimensions = image.scale(scale);
    return { width: dimensions.width, height: dimensions.height };
  }
  return {
    width: image.width * scale,
    height: image.width * scale
  };
}
