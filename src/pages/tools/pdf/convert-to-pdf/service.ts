import jsPDF from 'jspdf';
import { Orientation, PageType, ImageSize } from './types';

export interface ComputeOptions {
  files: File[];
  pageType: PageType;
  orientation: Orientation;
  scale: number; // 10..100 (only applied for A4)
}

export interface ComputeResult {
  pdfFile: File;
  imageSize: ImageSize;
}

interface LoadedImage {
  image: HTMLImageElement;
  objectUrl: string;
  format: 'PNG' | 'JPEG';
}

function getPdfImageFormat(file: File): 'PNG' | 'JPEG' {
  if (file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')) {
    return 'PNG';
  }

  return 'JPEG';
}

async function loadImage(file: File): Promise<LoadedImage> {
  const image = new Image();
  const objectUrl = URL.createObjectURL(file);
  image.src = objectUrl;
  await image.decode();
  return { image, objectUrl, format: getPdfImageFormat(file) };
}

export async function buildPdf({
  files,
  pageType,
  orientation,
  scale
}: ComputeOptions): Promise<ComputeResult> {
  if (!files.length) {
    throw new Error('No files selected');
  }

  let loadedImages: LoadedImage[] = [];

  try {
    const pxToMm = (px: number) => px * 0.264583;
    loadedImages = await Promise.all(files.map((file) => loadImage(file)));
    const firstImage = loadedImages[0].image;
    const firstImageWidthMm = pxToMm(firstImage.width);
    const firstImageHeightMm = pxToMm(firstImage.height);

    const pdf =
      pageType === 'full'
        ? new jsPDF({
            orientation:
              firstImageWidthMm > firstImageHeightMm ? 'landscape' : 'portrait',
            unit: 'mm',
            format: [firstImageWidthMm, firstImageHeightMm]
          })
        : new jsPDF({
            orientation,
            unit: 'mm',
            format: 'a4'
          });

    pdf.setDisplayMode('fullwidth');

    for (let index = 0; index < loadedImages.length; index += 1) {
      const { image, format } = loadedImages[index];
      const imageWidthMm = pxToMm(image.width);
      const imageHeightMm = pxToMm(image.height);

      if (index > 0) {
        if (pageType === 'full') {
          pdf.addPage(
            [imageWidthMm, imageHeightMm],
            imageWidthMm > imageHeightMm ? 'landscape' : 'portrait'
          );
        } else {
          pdf.addPage('a4', orientation);
        }
      }

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const widthRatio = pageWidth / image.width;
      const heightRatio = pageHeight / image.height;
      const fitScale = Math.min(widthRatio, heightRatio);

      const finalWidth =
        pageType === 'full'
          ? pageWidth
          : image.width * fitScale * (scale / 100);

      const finalHeight =
        pageType === 'full'
          ? pageHeight
          : image.height * fitScale * (scale / 100);

      const x = pageType === 'full' ? 0 : (pageWidth - finalWidth) / 2;
      const y = pageType === 'full' ? 0 : (pageHeight - finalHeight) / 2;

      pdf.addImage(image, format, x, y, finalWidth, finalHeight);
    }

    const blob = pdf.output('blob');
    const firstFileName = files[0].name.replace(/\.[^/.]+$/, '');
    const fileName =
      files.length === 1
        ? `${firstFileName}.pdf`
        : `${firstFileName}-merged.pdf`;

    return {
      pdfFile: new File([blob], fileName, { type: 'application/pdf' }),
      imageSize: {
        widthMm: firstImageWidthMm,
        heightMm: firstImageHeightMm,
        widthPx: firstImage.width,
        heightPx: firstImage.height
      }
    };
  } finally {
    loadedImages.forEach(({ objectUrl }) => URL.revokeObjectURL(objectUrl));
  }
}
