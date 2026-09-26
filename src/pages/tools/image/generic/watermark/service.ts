import { InitialValuesType, Position } from './types';
import { heicTo, isHeic } from 'heic-to';
import JSZip from 'jszip';

function computePosition(
  position: Position,
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

const processImage = async (
  file: File,
  options: InitialValuesType
): Promise<File | undefined> => {
  const { watermarkOpacity, fontSize, position, color } = options;

  let processedFile = file;

  if (await isHeic(file)) {
    const convertedBlob = await heicTo({ blob: file, type: 'image/jpeg' });
    processedFile = new File(
      [convertedBlob],
      file.name.replace(/\.[^/.]+$/, '') + '.jpg',
      { type: 'image/jpeg' }
    );
  }

  // Skip formats we don't watermark yet
  if (processedFile.type === 'image/svg+xml') {
    console.warn('SVG watermark not supported yet.');
    return;
  }
  if (processedFile.type === 'image/gif') {
    console.warn('GIF watermark not supported yet.');
    return;
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx == null) return;

  const img = new Image();
  img.src = URL.createObjectURL(processedFile);

  try {
    await img.decode();

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // Watermark text from the original filename
    const text = options.filename
      ? file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[_-]+/g, ' ')
          .trim()
      : options.watermark;

    if (!text) return;

    const padding = Math.max(
      12,
      Math.round(Math.min(canvas.width, canvas.height) * 0.02)
    );

    ctx.save();
    ctx.globalAlpha = watermarkOpacity;
    ctx.fillStyle = color;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.shadowColor = 'rgba(0,0,0,0.65)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    const pos = computePosition(position, canvas.width, canvas.height, padding);
    ctx.textAlign = pos.align;
    ctx.textBaseline = pos.baseline;

    ctx.fillText(text, pos.x, pos.y);
    ctx.restore();

    // Keep the original format (PNG/JPEG/WebP), default to PNG otherwise
    const outputType =
      processedFile.type === 'image/jpeg' || processedFile.type === 'image/webp'
        ? processedFile.type
        : 'image/png';
    const ext =
      outputType === 'image/jpeg'
        ? 'jpeg'
        : outputType === 'image/webp'
          ? 'webp'
          : 'png';
    const quality = outputType === 'image/jpeg' ? 0.92 : undefined;

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const fileName =
              file.name.replace(/\.[^/.]+$/, '') + `_watermarked.${ext}`;
            resolve(new File([blob], fileName, { type: outputType }));
          } else {
            resolve(undefined);
          }
        },
        outputType,
        quality
      );
    });
  } catch (error) {
    console.error('Error processing image:', error);
  } finally {
    URL.revokeObjectURL(img.src);
  }
};

export const watermarkImages = async (
  files: File[],
  options: InitialValuesType
): Promise<{ results: File[]; zipFile: File | null } | null> => {
  try {
    const watermarked = await Promise.all(
      files.map(async (file) => {
        try {
          return (await processImage(file, options)) ?? null;
        } catch (error) {
          console.error(`Error watermarking ${file.name}:`, error);
          return null;
        }
      })
    );

    const results = watermarked.filter((f): f is File => f !== null);

    if (results.length === 0) return null;

    if (results.length === 1) return { results, zipFile: null };

    const zip = new JSZip();
    results.forEach((file) => zip.file(file.name, file));
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipFile = new File([zipBlob], 'watermarked-images.zip', {
      type: 'application/zip'
    });

    return { results, zipFile };
  } catch (error) {
    console.error('Error watermarking images:', error);
    return null;
  }
};
