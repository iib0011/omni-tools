import { degrees, PDFDocument } from 'pdf-lib';
import { InitialValuesType } from './types';

/**
 * Parses a page range string and returns an array of page numbers
 * @param pageRangeStr String like "1,3-5,7" to extract pages 1, 3, 4, 5, and 7
 * @param totalPages Total number of pages in the PDF
 * @returns Array of page numbers to extract
 */
export function parsePageRanges(
  pageRangeStr: string,
  totalPages: number
): number[] {
  if (!pageRangeStr.trim()) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pageNumbers = new Set<number>();
  const ranges = pageRangeStr.split(',');

  for (const range of ranges) {
    const trimmedRange = range.trim();

    if (trimmedRange.includes('-')) {
      const [start, end] = trimmedRange.split('-').map(Number);
      if (!isNaN(start) && !isNaN(end)) {
        // Handle both forward and reversed ranges
        const normalizedStart = Math.min(start, end);
        const normalizedEnd = Math.max(start, end);

        for (
          let i = Math.max(1, normalizedStart);
          i <= Math.min(totalPages, normalizedEnd);
          i++
        ) {
          pageNumbers.add(i);
        }
      }
    } else {
      const pageNum = parseInt(trimmedRange, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        pageNumbers.add(pageNum);
      }
    }
  }

  return [...pageNumbers].sort((a, b) => a - b);
}

/**
 * Rotates pages in a PDF file
 * @param pdfFile The input PDF file
 * @param options Options including rotation angle and page selection
 * @returns Promise resolving to a new PDF file with rotated pages
 */
export async function rotatePdf(
  pdfFile: File,
  options: InitialValuesType
): Promise<File> {
  const { rotationAngle, applyToAllPages, pageRanges } = options;

  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const totalPages = pdfDoc.getPageCount();

  // Determine which pages to rotate
  const pagesToRotate = applyToAllPages
    ? Array.from({ length: totalPages }, (_, i) => i + 1)
    : parsePageRanges(pageRanges, totalPages);

  // Apply rotation to selected pages
  for (const pageNum of pagesToRotate) {
    const page = pdfDoc.getPage(pageNum - 1);
    page.setRotation(degrees(rotationAngle));
  }

  // Save the modified PDF
  const modifiedPdfBytes = await pdfDoc.save();
  const newFileName = pdfFile.name.replace('.pdf', '-rotated.pdf');

  return new File([modifiedPdfBytes], newFileName, { type: 'application/pdf' });
}
