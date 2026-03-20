import { InitialValuesType } from './types';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';

export const compressImages = async (
  files: File[],
  options: InitialValuesType
): Promise<{ results: File[]; zipFile: File } | null> => {
  try {
    const { maxFileSizeInMB, quality } = options;

    // Configuration for the compression library
    const compressionOptions = {
      maxSizeMB: maxFileSizeInMB,
      maxWidthOrHeight: 1920, // Reasonable default for most use cases
      useWebWorker: true,
      initialQuality: quality / 100 // Convert percentage to decimal
    };

    // Compress the given images
    const compressed = await Promise.all(
      files.map(async (file) => {
        try {
          const compressedFile = await imageCompression(
            file,
            compressionOptions
          );
          return new File([compressedFile], file.name, {
            type: compressedFile.type
          });
        } catch (error) {
          console.error(`Error compressing ${file.name}:`, error);
          return null;
        }
      })
    );

    const results = compressed.filter((f): f is File => f !== null);

    if (results.length === 0) return null;

    const zip = new JSZip();
    results.forEach((file) => zip.file(file.name, file));
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipFile = new File([zipBlob], 'compressed-images.zip', {
      type: 'application/zip'
    });

    return { results, zipFile };
  } catch (error) {
    console.error('Error compressing images:', error);
    return null;
  }
};
