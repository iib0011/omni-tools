import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min?url';
import { Document, Packer, Paragraph, TextRun } from 'docx';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function convertPdfToWord(pdfFile: File): Promise<File> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const paragraphs: Paragraph[] = [];

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ').trim();

    if (pageText) {
      paragraphs.push(new Paragraph({ children: [new TextRun(pageText)] }));
    }

    // Page break between pages (except last)
    if (i < pdfDoc.numPages) {
      paragraphs.push(new Paragraph({ pageBreakBefore: true, children: [] }));
    }
  }

  const doc = new Document({ sections: [{ children: paragraphs }] });
  const blob = await Packer.toBlob(doc);

  return new File([blob], pdfFile.name.replace(/\.pdf$/i, '.docx'), {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
}
