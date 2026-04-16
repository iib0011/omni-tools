import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import { PdfImageObject, PreProcessImageObject } from './types';
import JSZip from 'jszip';

// Initialise The PDF JS Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function processPDF(
  input: File
): Promise<{ extractedImages: File[]; zipFile: File | null } | null> {
  // Decode File
  const url = URL.createObjectURL(input);
  const preProcessImages: PreProcessImageObject[] = [];

  try {
    // Wait for fully processed
    const pdf = await pdfjsLib.getDocument(url).promise;

    // Iterate through pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const ops = await page.getOperatorList();
      let imageNum = 1;

      // Look through commands
      for (let i = 0; i < ops.fnArray.length; i++) {
        const fn = ops.fnArray[i];

        // Matches Image Object
        if (fn === pdfjsLib.OPS.paintImageXObject) {
          // Extract Data
          const imgName = ops.argsArray[i][0];

          // Wait for the callback to finish
          const img = (await new Promise((resolve) => {
            page.objs.get(imgName, resolve);
          })) as PdfImageObject;

          // Add File into Array (Map this later to draw on canvas concurrently)
          const preProcessImage: PreProcessImageObject = {
            img,
            pageNum,
            imageNum
          };

          preProcessImages.push(preProcessImage);

          // Add Image Counter
          imageNum++;
        }
      }
    }
    // Draw All Images concurrently, then drop the null values
    const extractedImages = (
      await Promise.all(
        preProcessImages.map((preProcessImage) => processImage(preProcessImage))
      )
    ).filter((i) => i !== null);

    // Bundle Together as Zip
    // Checking the Need to Convert
    if (extractedImages.length === 0) return null;

    if (extractedImages.length === 1) return { extractedImages, zipFile: null };

    // Converting Into Zip File
    const zip = new JSZip();

    extractedImages.forEach((file) => zip.file(file.name, file));
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipFile = new File([zipBlob], 'compressed-images.zip', {
      type: 'application/zip'
    });

    return { extractedImages, zipFile };
  } catch (error) {
    console.log('Error processing pdf', error);
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function processImage(
  preProcessImage: PreProcessImageObject
): Promise<File | null> {
  const { img, pageNum, imageNum } = preProcessImage;

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
    ctx.drawImage(img.bitmap, 0, 0);

    // Convert to Blob
    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject('Canvas toBlob returned null')),
        'image/png'
      );
    });

    if (!blob) return null;

    // Return file
    const fileName = `page_${pageNum}_img_${img.ref}_${imageNum}`;
    return new File([blob], fileName, { type: 'image/png' });
  } catch (error) {
    console.log('Error converting toBlob', error);
    return null;
  }
}
