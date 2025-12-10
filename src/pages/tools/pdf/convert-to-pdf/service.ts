import jsPDF from 'jspdf';
import { Orientation, PageType, ImageSize } from './types';

export interface ComputeOptions {
  file: File;
  pageType: PageType;
  orientation: Orientation;
  scale: number; // 10..100 (only applied for A4)
}

export interface ComputeResult {
  pdfFile: File;
  imageSize: ImageSize;
}

export async function buildPdf({
  file,
  pageType,
  orientation,
  scale
}: ComputeOptions): Promise<ComputeResult> {
  const img = new Image();
  img.src = URL.createObjectURL(file);

  try {
    await img.decode();

    const pxToMm = (px: number) => px * 0.264583;
    const imgWidthMm = pxToMm(img.width);
    const imgHeightMm = pxToMm(img.height);

    const pdf =
      pageType === 'full'
        ? new jsPDF({
            orientation: imgWidthMm > imgHeightMm ? 'landscape' : 'portrait',
            unit: 'mm',
            format: [imgWidthMm, imgHeightMm]
          })
        : new jsPDF({
            orientation,
            unit: 'mm',
            format: 'a4'
          });

    pdf.setDisplayMode('fullwidth');

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const widthRatio = pageWidth / img.width;
    const heightRatio = pageHeight / img.height;
    const fitScale = Math.min(widthRatio, heightRatio);

    const finalWidth =
      pageType === 'full' ? pageWidth : img.width * fitScale * (scale / 100);

    const finalHeight =
      pageType === 'full' ? pageHeight : img.height * fitScale * (scale / 100);

    const x = pageType === 'full' ? 0 : (pageWidth - finalWidth) / 2;
    const y = pageType === 'full' ? 0 : (pageHeight - finalHeight) / 2;

    pdf.addImage(img, 'JPEG', x, y, finalWidth, finalHeight);

    const blob = pdf.output('blob');
    const fileName = file.name.replace(/\.[^/.]+$/, '') + '.pdf';

    return {
      pdfFile: new File([blob], fileName, { type: 'application/pdf' }),
      imageSize: {
        widthMm: imgWidthMm,
        heightMm: imgHeightMm,
        widthPx: img.width,
        heightPx: img.height
      }
    };
  } finally {
    URL.revokeObjectURL(img.src);
  }
}
