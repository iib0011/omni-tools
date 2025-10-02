import { PDFDocument } from 'pdf-lib';

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
 * Splits a PDF file based on specified page ranges
 * @param pdfFile The input PDF file
 * @param pageRanges String specifying which pages to extract (e.g., "1,3-5,7")
 * @returns Promise resolving to a new PDF file with only the selected pages
 */
export async function splitPdf(
  pdfFile: File,
  pageRanges: string
): Promise<File> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer);
  const totalPages = sourcePdf.getPageCount();
  const pagesToExtract = parsePageRanges(pageRanges, totalPages);

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(
    sourcePdf,
    pagesToExtract.map((pageNum) => pageNum - 1)
  );
  copiedPages.forEach((page) => newPdf.addPage(page));

  const newPdfBytes = await newPdf.save();
  const newFileName = pdfFile.name.replace('.pdf', '-extracted.pdf');
  return new File([newPdfBytes as any], newFileName, {
    type: 'application/pdf'
  });
}
