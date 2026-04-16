import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import { PdfImage } from './types';

// Initialise The PDF JS Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function processPDF(input: File) {
  // Decode File
  const url = URL.createObjectURL(input);

  try {
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
          const imgName = await ops.argsArray[i][0];
          const img = await page.objs.get(imgName);

          // TODO: Img Null? - Need to Wait Longer
          console.log('Image created is ', img);

          // Retrieve File
          const file = await processImage(img);
          console.log('File is ', file);
        }
      }
    }
  } catch (error) {
    console.log('Error processing pdf', error);
  } finally {
    URL.revokeObjectURL(url);
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
