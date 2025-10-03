import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface TextItem {
  str: string;
  dir: string;
  width: number;
  height: number;
  transform: number[];
  fontName: string;
  hasEOL: boolean;
}

interface TextContent {
  items: TextItem[];
  styles: Record<string, any>;
}

export async function convertPdfToWord(pdfFile: File): Promise<File> {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';
  let documentTitle = pdfFile.name.replace(/\.pdf$/i, '');

  // Extract text from all pages
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = (await page.getTextContent()) as TextContent;

    // Process text items and maintain basic formatting
    let pageText = '';
    let lastY = -1;

    textContent.items.forEach((item) => {
      const currentY = item.transform[5];

      // If Y position changed significantly, it's likely a new line
      if (lastY !== -1 && Math.abs(lastY - currentY) > 5) {
        pageText += '\n';
      }

      pageText += item.str;

      // Add space if the item doesn't end with space and next item doesn't start with space
      if (item.hasEOL) {
        pageText += '\n';
      } else {
        pageText += ' ';
      }

      lastY = currentY;
    });

    fullText += pageText.trim() + '\n\n';
  }

  // Create a basic Word document structure using RTF format
  // RTF is simpler to generate than DOCX and is supported by Word
  const rtfContent = createRTFDocument(fullText.trim(), documentTitle);

  // Create the file
  const wordBlob = new Blob([rtfContent], {
    type: 'application/rtf'
  });

  const wordFile = new File(
    [wordBlob],
    pdfFile.name.replace(/\.pdf$/i, '.rtf'),
    { type: 'application/rtf' }
  );

  return wordFile;
}

function createRTFDocument(text: string, title: string): string {
  // Basic RTF structure
  const rtfHeader = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}`;
  const rtfTitle = `\\f0\\fs24\\b ${escapeRTF(title)}\\b0\\par\\par`;
  const rtfBody = escapeRTF(text).replace(/\n/g, '\\par ');
  const rtfFooter = `}`;

  return rtfHeader + rtfTitle + rtfBody + rtfFooter;
}

function escapeRTF(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/{/g, '\\{').replace(/}/g, '\\}');
}
