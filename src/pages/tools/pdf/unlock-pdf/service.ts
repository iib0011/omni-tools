import { InitialValuesType } from './types';
import { loadPDFData } from '../utils';
import { unlockWithGhostScript } from '../../../../lib/ghostscript/worker-init';

export async function unlockPdf(
  pdfFile: File,
  options: InitialValuesType
): Promise<File> {
  // Check if file is a PDF
  if (pdfFile.type !== 'application/pdf') {
    throw new Error('The provided file is not a PDF');
  }

  const dataObject = {
    psDataURL: URL.createObjectURL(pdfFile),
    speed: options.speed
  };
  const protectedFileUrl: string = await unlockWithGhostScript(dataObject);
  return await loadPDFData(
    protectedFileUrl,
    pdfFile.name.replace('.pdf', '-unlocked.pdf')
  );
}
