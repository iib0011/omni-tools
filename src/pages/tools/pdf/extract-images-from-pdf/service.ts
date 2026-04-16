import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker?url';
import { PdfImage } from './types';

// Initialise The PDF JS Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function processPDF(url: string) {
  // Wait for fully processed
  const pdf = await pdfjsLib.getDocument(url).promise;

  // Iterate through pages
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const ops = await page.getOperatorList();

    // Look through commands
    for (let i = 0; i < ops.fnArray.length; i++) {
      const fn = ops.fnArray[i];

      // Matches Image Object
      if (fn === pdfjsLib.OPS.paintImageXObject) {
        // Extract Data
        const imgName = ops.argsArray[i][0];
        const img = (await page.objs.get(imgName)) as PdfImage;

        // Retrieve File
        const file = await processImage(img);
      }
    }
  }
}

async function processImage(img: PdfImage): Promise<File | null> {
  try {
    // Create Canvas
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return null;
    }

    // Draw Onto Canvas
    const imgData = ctx.createImageData(img.width, img.height);
    imgData.data.set(img.data);
    ctx.putImageData(imgData, 0, 0);

    // Convert to Blob
    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject('Canvas toBlob returned null')),
        'image/png'
      );
    });

    if (!blob) return null;

    // Return file
    const fileName = 'File Name Sample';
    return new File([blob], fileName, { type: 'image/png' });
  } catch (error) {
    console.log('Error converting toBlob', error);
    return null;
  }
}
