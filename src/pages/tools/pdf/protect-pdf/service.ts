import { PDFDocument } from 'pdf-lib';
import { InitialValuesType } from './types';
import {
  compressWithGhostScript,
  protectWithGhostScript
} from '../../../../lib/ghostscript/worker-init';
import { loadPDFData } from '../utils';

/**
 * Protects a PDF file with a password
 *
 * @param pdfFile - The PDF file to protect
 * @param options - Protection options including password and protection type
 * @returns A Promise that resolves to a password-protected PDF File
 */
export async function protectPdf(
  pdfFile: File,
  options: InitialValuesType
): Promise<File> {
  // Check if file is a PDF
  if (pdfFile.type !== 'application/pdf') {
    throw new Error('The provided file is not a PDF');
  }

  // Check if passwords match
  if (options.password !== options.confirmPassword) {
    throw new Error('Passwords do not match');
  }

  // Check if password is empty
  if (!options.password) {
    throw new Error('Password cannot be empty');
  }

  const dataObject = {
    psDataURL: URL.createObjectURL(pdfFile),
    password: options.password
  };
  const protectedFileUrl: string = await protectWithGhostScript(dataObject);
  return await loadPDFData(
    protectedFileUrl,
    pdfFile.name.replace('.pdf', '-protected.pdf')
  );
}
