import { InitialValuesType, ConversionResult } from './types';

/**
 * Converts HEIC/HEIF images to other formats
 * Uses browser's native capabilities and canvas for conversion
 */
export async function convertHeicImage(
  file: File,
  options: InitialValuesType
): Promise<ConversionResult> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    const img = new Image();

    img.onload = () => {
      try {
        // Calculate dimensions based on resize mode
        let { width, height } = calculateDimensions(
          img.width,
          img.height,
          options.resizeMode,
          options.resizeValue
        );

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw image with white background (for transparency handling)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to desired format
        const mimeType = getMimeType(options.outputFormat);
        const quality =
          options.outputFormat === 'jpg' ? options.quality / 100 : 1;

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to convert image'));
              return;
            }

            const fileName = generateFileName(file.name, options.outputFormat);
            const convertedFile = new File([blob], fileName, {
              type: mimeType
            });

            const result: ConversionResult = {
              file: convertedFile,
              originalSize: file.size,
              convertedSize: convertedFile.size,
              format: options.outputFormat
            };

            resolve(result);
          },
          mimeType,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load HEIC image'));
    };

    // Create object URL for the image
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    // Clean up object URL after loading
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
    };
  });
}

/**
 * Calculate new dimensions based on resize mode
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  resizeMode: InitialValuesType['resizeMode'],
  resizeValue: number
): { width: number; height: number } {
  switch (resizeMode) {
    case 'width': {
      const aspectRatio = originalWidth / originalHeight;
      return {
        width: resizeValue,
        height: Math.round(resizeValue / aspectRatio)
      };
    }
    case 'height': {
      const aspectRatio2 = originalWidth / originalHeight;
      return {
        width: Math.round(resizeValue * aspectRatio2),
        height: resizeValue
      };
    }
    case 'both': {
      return {
        width: resizeValue,
        height: resizeValue
      };
    }
    default: {
      return {
        width: originalWidth,
        height: originalHeight
      };
    }
  }
}

/**
 * Get MIME type for output format
 */
function getMimeType(format: InitialValuesType['outputFormat']): string {
  switch (format) {
    case 'jpg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    default:
      return 'image/jpeg';
  }
}

/**
 * Generate output filename with correct extension
 */
function generateFileName(
  originalName: string,
  format: InitialValuesType['outputFormat']
): string {
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  const extension = format === 'jpg' ? 'jpg' : format;
  return `${baseName}.${extension}`;
}

/**
 * Validate if file is a HEIC/HEIF image
 */
export function isHeicFile(file: File): boolean {
  const heicTypes = ['image/heic', 'image/heif'];
  return (
    heicTypes.includes(file.type) ||
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif')
  );
}

/**
 * Get file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
