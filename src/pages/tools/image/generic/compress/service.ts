import { InitialValuesType } from './types';
import imageCompression from 'browser-image-compression';

export const compressImage = async (
  file: File,
  options: InitialValuesType
): Promise<File | null> => {
  try {
    const { maxFileSizeInMB, quality } = options;

    // Configuration for the compression library
    const compressionOptions = {
      maxSizeMB: maxFileSizeInMB,
      maxWidthOrHeight: 1920, // Reasonable default for most use cases
      useWebWorker: true,
      initialQuality: quality / 100 // Convert percentage to decimal
    };

    // Compress the image
    const compressedFile = await imageCompression(file, compressionOptions);

    // Create a new file with the original name
    return new File([compressedFile], file.name, {
      type: compressedFile.type
    });
  } catch (error) {
    console.error('Error compressing image:', error);
    return null;
  }
};
