import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min?url';
import { Document, Packer, Paragraph } from 'docx';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export async function convertPdfToDocx(pdfFile: File): Promise<File> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const textChunks: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const strings = textContent.items.map((item: any) => item.str);
    textChunks.push(strings.join(' '));
  }

  const paragraphs = textChunks.map((text) => new Paragraph(text));
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  return new File([blob], pdfFile.name.replace(/\.pdf$/i, '.docx'), {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
}
