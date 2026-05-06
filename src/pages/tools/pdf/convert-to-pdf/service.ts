import jsPDF from 'jspdf';
import { ImageSize, InitialValuesType, LoadedImage } from './types';
import { heicTo, isHeic } from 'heic-to';

const pxToMm = (px: number) => px * 0.264583;

function returnImageFormat(file: File): 'PNG' | 'JPEG' {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  if (type.includes('png') || name.endsWith('.png')) return 'PNG';

  if (
    type.includes('jpeg') ||
    type.includes('jpg') ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg')
  ) {
    return 'JPEG';
  }

  if (type.includes('webp') || name.endsWith('.webp')) return 'JPEG';

  if (type.includes('gif') || name.endsWith('.gif')) return 'JPEG';

  console.warn(`Unsupported format: ${file.type}, defaulting to JPEG`);
  return 'JPEG';
}

async function loadImage(file: File): Promise<LoadedImage> {
  let processedFile = file;

  if (await isHeic(file)) {
    const convertedBlob = await heicTo({
      blob: file,
      type: 'image/jpeg'
    });

    processedFile = new File([convertedBlob], file.name + '.jpg', {
      type: 'image/jpeg'
    });
  }

  const image = new Image();
  const objectUrl = URL.createObjectURL(processedFile);
  image.src = objectUrl;
  await image.decode();
  return {
    image,
    objectUrl,
    format: returnImageFormat(file),
    filename: processedFile.name
  };
}

export async function buildPdf(
  files: File[],
  options: InitialValuesType
): Promise<{ pdfFile: File; imageSizes: ImageSize[] }> {
  if (!files.length) {
    throw new Error('No files selected');
  }

  const { pageType, orientation, scale } = options;

  let loadedImages: LoadedImage[] = [];
  const imageSizes: ImageSize[] = [];

  const results = await Promise.all(
    files.map((file) =>
      loadImage(file).catch((err) => {
        console.warn(`Skipping ${file.name}:`, err);
        return null;
      })
    )
  );

  loadedImages = results.filter((img): img is LoadedImage => img !== null);

  if (!loadedImages.length) {
    throw new Error('No images could be loaded');
  }

  const { image: firstImage, filename: firstImageFileName } = loadedImages[0];
  const firstImageWidthMm = pxToMm(firstImage.width);
  const firstImageHeightMm = pxToMm(firstImage.height);

  try {
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
      imageSizes.push({
        widthMm: imageWidthMm,
        heightMm: imageHeightMm,
        widthPx: image.width,
        heightPx: image.height
      });
    }

    const blob = pdf.output('blob');
    const firstFileName = firstImageFileName.replace(/\.[^/.]+$/, '');
    const fileName =
      files.length === 1 ? `${firstFileName}.pdf` : 'merged-images.pdf';

    return {
      pdfFile: new File([blob], fileName, { type: 'application/pdf' }),
      imageSizes: imageSizes
    };
  } finally {
    loadedImages.forEach(({ objectUrl }) => URL.revokeObjectURL(objectUrl));
  }
}
