import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import { Document, Paragraph, TextRun, Packer } from 'docx';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function convertPdfToDOCX(
  file: File
): Promise<{ docxBlob: Blob; file: File }> {
  const url = URL.createObjectURL(file);

  try {
    const loadingTask = pdfjsLib.getDocument(url);
    const pdfDocument = await loadingTask.promise;
    const paragraphs: Paragraph[] = [];

    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();

      let currentLineText = '';

      for (const item of textContent.items) {
        if ('str' in item) {
          currentLineText += item.str + ' ';
          if (item.hasEOL) {
            paragraphs.push(
              new Paragraph({
                children: [new TextRun(currentLineText.trim())]
              })
            );
            currentLineText = '';
          }
        }
      }

      if (currentLineText.trim()) {
        paragraphs.push(
          new Paragraph({ children: [new TextRun(currentLineText.trim())] })
        );
      }
    }
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs
        }
      ]
    });

    const docxBlob = await Packer.toBlob(doc);
    const docxFileName = file.name.replace(/\.[^/.]+$/, '') + '.docx';
    const docxFile = new File([docxBlob], docxFileName, {
      type: docxBlob.type
    });

    return { docxBlob, file: docxFile };
  } finally {
    URL.revokeObjectURL(url);
  }
}
