import { InitialValuesType } from './types';
import { compressWithGhostScript } from '../../../../lib/ghostscript/worker-init';
import { loadPDFData } from '../utils';

/**
 * Compresses a PDF file using either Ghostscript WASM (preferred)
 * or falls back to pdf-lib if WASM fails
 *
 * @param pdfFile - The PDF file to compress
 * @param options - Compression options including compression level
 * @returns A Promise that resolves to a compressed PDF File
 */
export async function compressPdf(
  pdfFile: File,
  options: InitialValuesType
): Promise<File> {
  // Check if file is a PDF
  if (pdfFile.type !== 'application/pdf') {
    throw new Error('The provided file is not a PDF');
  }

  const dataObject = {
    psDataURL: URL.createObjectURL(pdfFile),
    compressionLevel: options.compressionLevel
  };
  const compressedFileUrl: string = await compressWithGhostScript(dataObject);
  return await loadPDFData(compressedFileUrl, pdfFile.name);
}
