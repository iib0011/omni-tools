import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min?url';
import { zipFiles } from '@utils/zip';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

type ImagePreview = {
  blob: Blob;
  url: string;
  filename: string;
};

export async function convertPdfToPngImages(pdfFile: File): Promise<{
  images: ImagePreview[];
  zipFile: File;
}> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const images: ImagePreview[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvas, canvasContext: context, viewport }).promise;

    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => b && resolve(b), 'image/png')
    );

    const filename = `page-${i}.png`;
    const url = URL.createObjectURL(blob);
    images.push({ blob, url, filename });
  }

  const zipFile = await zipFiles(
    images.map(({ blob, filename }) => ({ blob, filename })),
    pdfFile.name.replace(/\.pdf$/i, '-pages.zip')
  );

  return { images, zipFile };
}
