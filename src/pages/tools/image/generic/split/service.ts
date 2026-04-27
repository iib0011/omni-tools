import { InitialValuesType, units } from './types';
import { PDFDocument, PageSizes } from 'pdf-lib';

async function splitImage(
  initImg: HTMLImageElement,
  widthOfEachPart: number,
  heightOfEachPart: number
): Promise<File[]> {
  const { width, height } = initImg;
  const horParts = Math.ceil(width / widthOfEachPart);
  const verParts = Math.ceil(height / heightOfEachPart);

  const promises: Promise<File>[] = [];

  for (let y = 0; y < verParts; y++) {
    for (let x = 0; x < horParts; x++) {
      const tileW = Math.min(widthOfEachPart, width - x * widthOfEachPart);
      const tileH = Math.min(heightOfEachPart, height - y * heightOfEachPart);

      const canvas = document.createElement('canvas');
      canvas.width = tileW;
      canvas.height = tileH;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      ctx.drawImage(
        initImg,
        x * widthOfEachPart,
        y * heightOfEachPart,
        tileW,
        tileH,
        0,
        0,
        tileW,
        tileH
      );

      promises.push(canvasToFile(canvas, `part-${x}-${y}.png`));
    }
  }

  return Promise.all(promises);
}

export async function splitImagesToPDF(
  input: File,
  values: InitialValuesType
): Promise<File> {
  const initImg = await loadImage(input);

  const [pageWidth, pageHeight] = PageSizes[values.pageFormat];
  const ptPerOneSquare = toPts(values.unitsPerOneSquare, values.unitKind);
  const pxPerPt =
    values.pxPerSquareQuantity / (ptPerOneSquare * values.squareQuantity);
  const paddingInPts = toPts(values.padding, values.unitKind);
  const pageWidthWithPadding = pageWidth - 2 * paddingInPts;
  const pageHeightWithPadding = pageHeight - 2 * paddingInPts;

  const imgParts = await splitImage(
    initImg,
    Math.round(pageWidthWithPadding * pxPerPt),
    Math.round(pageHeightWithPadding * pxPerPt)
  );

  const pdfDoc = await PDFDocument.create();

  for (const imgFile of imgParts) {
    const img = await pdfDoc.embedPng(await imgFile.arrayBuffer());
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    page.drawImage(img, {
      x: paddingInPts,
      y: paddingInPts,
      width: pageWidthWithPadding,
      height: pageHeightWithPadding
    });
  }

  const pdfBytes = await pdfDoc.save();

  return new File(
    [pdfBytes as BlobPart],
    input.name.replace(/\.([^.]+)?$/i, `-${Date.now()}.pdf`),
    { type: 'application/pdf' }
  );
}

export function loadImage(input: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(input);
    img.src = url;
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
  });
}

function canvasToFile(canvas: HTMLCanvasElement, name: string): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(new File([blob], name, { type: 'image/png' }));
      } else {
        reject(new Error('Failed to create blob'));
      }
    }, 'image/png');
  });
}

export function toPts(number: number, units: units): number {
  switch (units) {
    case 'pt':
      return number;
    case 'mm':
      return (number * 72) / 25.4;
    case 'in':
      return number * 72;
  }
}

export function fromPts(number: number, units: units): number {
  switch (units) {
    case 'pt':
      return number;
    case 'mm':
      return (number * 25.4) / 72;
    case 'in':
      return number / 72;
  }
}
