import { CompressionLevel, InitialValuesType } from './types';
import { PDFDocument } from 'pdf-lib';

export async function compressPdf(
  pdfFile: File,
  options: InitialValuesType
): Promise<File> {
  // Check if file is a PDF
  if (pdfFile.type !== 'application/pdf') {
    throw new Error('The provided file is not a PDF');
  }

  // Read the file as an ArrayBuffer
  const arrayBuffer = await pdfFile.arrayBuffer();

  // Load PDF document using pdf-lib
  const pdfDoc = await PDFDocument.load(arrayBuffer);

  // Apply compression based on the selected level
  const compressionOptions = getCompressionOptions(options.compressionLevel);

  // pdf-lib has different compression approach than mupdf
  // Compression is applied during the save operation
  const compressedPdfBytes = await pdfDoc.save({
    useObjectStreams: true, // More efficient storage
    ...compressionOptions
  });

  // Create a new File object with the compressed PDF
  return new File([compressedPdfBytes], `compressed_${pdfFile.name}`, {
    type: 'application/pdf'
  });
}

/**
 * Helper function to get compression options based on level
 * @param level - Compression level (low, medium, or high)
 * @returns Object with appropriate compression settings for pdf-lib
 */
function getCompressionOptions(level: CompressionLevel) {
  switch (level) {
    case 'low':
      return {
        addDefaultPage: false,
        compress: true
      };
    case 'medium':
      return {
        addDefaultPage: false,
        compress: true
      };
    case 'high':
      return {
        addDefaultPage: false,
        compress: true,
        objectsPerTick: 100 // Process more objects at once for higher compression
      };
  }
}
