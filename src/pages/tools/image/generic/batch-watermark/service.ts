import { InitialValuesType } from './types';

export function filenameToWatermarkText(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, '');
  return base.replace(/[_-]+/g, ' ').trim();
}

export function outputSpecForFile(file: File): {
  outputType: 'image/png' | 'image/jpeg' | 'image/webp';
  ext: 'png' | 'jpeg' | 'webp';
  quality?: number;
} {
  const inputType = file.type;

  const supported =
    inputType === 'image/png' ||
    inputType === 'image/jpeg' ||
    inputType === 'image/webp';

  const outputType = supported
    ? (inputType as 'image/png' | 'image/jpeg' | 'image/webp')
    : 'image/png';

  const ext =
    outputType === 'image/jpeg'
      ? 'jpeg'
      : outputType === 'image/webp'
        ? 'webp'
        : 'png';

  // Only used for JPEG
  const quality = outputType === 'image/jpeg' ? 0.92 : undefined;

  return { outputType, ext, quality };
}

function computePosition(
  position: InitialValuesType['position'],
  canvasWidth: number,
  canvasHeight: number,
  padding: number
) {
  switch (position) {
    case 'top-left':
      return {
        x: padding,
        y: padding,
        align: 'left' as const,
        baseline: 'top' as const
      };

    case 'top-right':
      return {
        x: canvasWidth - padding,
        y: padding,
        align: 'right' as const,
        baseline: 'top' as const
      };

    case 'bottom-left':
      return {
        x: padding,
        y: canvasHeight - padding,
        align: 'left' as const,
        baseline: 'bottom' as const
      };

    case 'center':
      return {
        x: canvasWidth / 2,
        y: canvasHeight / 2,
        align: 'center' as const,
        baseline: 'middle' as const
      };

    case 'bottom-right':
    default:
      return {
        x: canvasWidth - padding,
        y: canvasHeight - padding,
        align: 'right' as const,
        baseline: 'bottom' as const
      };
  }
}

export const processImage = async (
  file: File,
  options: InitialValuesType
): Promise<File | null> => {
  // Skip SVG for now (different pipeline)
  if (file.type === 'image/svg+xml') {
    console.warn('SVG watermark not supported yet.');
    return null;
  }

  // Skip GIF for now (frame-by-frame watermarking)
  if (file.type === 'image/gif') {
    console.warn('GIF watermark not supported yet.');
    return null;
  }

  const { watermarkOpacity, fontSize, position, color } = options;

  // Decode image
  const bitmap = await createImageBitmap(file);

  // Canvas setup
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Draw base image
  ctx.drawImage(bitmap, 0, 0);

  // Build watermark text from filename
  const text = filenameToWatermarkText(file.name);
  if (!text) return null;

  // Watermark styling
  const padding = Math.max(
    12,
    Math.round(Math.min(canvas.width, canvas.height) * 0.02)
  );

  ctx.save();
  ctx.globalAlpha = watermarkOpacity;
  ctx.fillStyle = color;
  ctx.font = `bold ${fontSize}px sans-serif`;

  // Shadow for readability
  ctx.shadowColor = 'rgba(0,0,0,0.65)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  const pos = computePosition(position, canvas.width, canvas.height, padding);
  ctx.textAlign = pos.align;
  ctx.textBaseline = pos.baseline;
  ctx.fillText(text, pos.x, pos.y);
  ctx.restore();

  // Output per-file format (PNG/JPEG/WebP)
  const { outputType, ext, quality } = outputSpecForFile(file);
  const base = file.name.replace(/\.[^.]+$/, '');
  const outName = `${base}_watermarked.${ext}`;

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(
      (b) => resolve(b),
      outputType,
      outputType === 'image/jpeg' ? quality : undefined
    );
  });

  if (!blob) return null;
  return new File([blob], outName, { type: outputType });
};
