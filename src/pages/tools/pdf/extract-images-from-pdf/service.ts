import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import JSZip from 'jszip';
import { PreProcessImageObject, PdfImageObject } from './types';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const RESOLVE_TIMEOUT_MS = 3000;

export async function processPDF(
  input: File
): Promise<{ extractedImages: File[]; zipFile: File | null } | null> {
  const url = URL.createObjectURL(input);
  const seenImages = new Set<string>();

  try {
    const pdf = await pdfjsLib.getDocument(url).promise;
    const extractedImages: File[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const ops = await page.getOperatorList();
      let imageNum = 1;

      for (let i = 0; i < ops.fnArray.length; i++) {
        const fn = ops.fnArray[i];

        try {
          let img: PdfImageObject | null = null;

          if (fn === pdfjsLib.OPS.paintImageXObject) {
            const imgName = ops.argsArray[i][0];
            if (seenImages.has(imgName)) continue;
            seenImages.add(imgName);

            img = (await Promise.race([
              new Promise((resolve) => page.objs.get(imgName, resolve)),
              new Promise((_, reject) =>
                setTimeout(
                  () =>
                    reject(new Error(`Timeout resolving image: ${imgName}`)),
                  RESOLVE_TIMEOUT_MS
                )
              )
            ])) as PdfImageObject;
          } else if (fn === pdfjsLib.OPS.paintInlineImageXObject) {
            img = ops.argsArray[i][0];
            if (!img) continue;

            const key = `${img.width}-${img.height}-${img.data?.length || 0}`;
            if (seenImages.has(key)) continue;
            seenImages.add(key);
          } else {
            continue;
          }

          if (!img || !img.width || !img.height) continue;

          const file = await processImage({ img, pageNum, imageNum });
          if (file) {
            extractedImages.push(file);
            imageNum++;
          }
        } catch {
          // skip failed images silently
        }
      }
    }

    if (extractedImages.length === 0) return null;
    return await bundleResult(extractedImages);
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function bundleResult(
  extractedImages: File[]
): Promise<{ extractedImages: File[]; zipFile: File | null }> {
  if (extractedImages.length === 1) return { extractedImages, zipFile: null };

  const zip = new JSZip();
  extractedImages.forEach((file) => zip.file(file.name, file));
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const zipFile = new File([zipBlob], 'images.zip', {
    type: 'application/zip'
  });

  return { extractedImages, zipFile };
}

async function processImage(
  preProcessImage: PreProcessImageObject
): Promise<File | null> {
  const { img, pageNum, imageNum } = preProcessImage;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    if (img.bitmap) {
      ctx.drawImage(img.bitmap, 0, 0);
    } else if (img.data) {
      const imageData = ctx.createImageData(img.width, img.height);
      imageData.data.set(img.data);
      ctx.putImageData(imageData, 0, 0);
    } else {
      return null;
    }

    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Canvas toBlob failed'))),
        'image/png'
      );
    });

    return new File([blob], `page_${pageNum}_img_${imageNum}.png`, {
      type: 'image/png'
    });
  } catch {
    return null;
  }
}
