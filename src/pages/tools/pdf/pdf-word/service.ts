import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';

import type {
  PDFPageProxy,
  PDFDocumentProxy
} from 'pdfjs-dist/types/src/display/api';
import type { TextContent, TextItem } from 'pdfjs-dist/types/src/display/api';

const PAGE_WIDTH_APPROX = 595;
const LEFT_MARGIN_THRESHOLD = 80;
const RIGHT_MARGIN_THRESHOLD = PAGE_WIDTH_APPROX - 80;
const CENTER_RANGE = 50;

const PARAGRAPH_GAP_FACTOR = 1.8;
const INDENTATION_THRESHOLD = 15;
const FONT_SIZE_CHANGE_THRESHOLD = 2;
const SAME_LINE_VERTICAL_TOLERANCE = 2;

type DocxAlignmentValue = (typeof AlignmentType)[keyof typeof AlignmentType];

type FormattedTextRun = {
  run: TextRun;
  text: string;
};

export async function convertPdfToWord(file: File): Promise<File> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf: PDFDocumentProxy = await pdfjsLib.getDocument({
    data: arrayBuffer
  }).promise;

  const paragraphs: Paragraph[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent: TextContent = await page.getTextContent();

    const pageViewport = page.getViewport({ scale: 1 });
    const processedDocxParagraphs = processTextContentForDocx(
      textContent,
      pageViewport.width
    );

    if (processedDocxParagraphs.length > 0) {
      paragraphs.push(...processedDocxParagraphs);
    } else {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: '[No text on this page]', italics: true })
          ],
          spacing: { after: 100 }
        })
      );
    }

    paragraphs.push(new Paragraph({ text: '', spacing: { after: 400 } }));
  }

  const doc = new Document({ sections: [{ children: paragraphs }] });

  const blob = await Packer.toBlob(doc);

  return new File([blob], file.name.replace(/\.pdf$/i, '.docx'), {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
}

function processTextContentForDocx(
  textContent: TextContent,
  pageActualWidth: number
): Paragraph[] {
  const docxParagraphs: Paragraph[] = [];

  const items: TextItem[] = textContent.items
    .filter(
      (item): item is TextItem =>
        'transform' in item && Array.isArray(item.transform)
    )
    .sort((a, b) => {
      const yA = a.transform[5];
      const yB = b.transform[5];
      const xA = a.transform[4];
      const xB = b.transform[4];

      if (Math.abs(yB - yA) > SAME_LINE_VERTICAL_TOLERANCE) {
        return yB - yA;
      }
      return xA - xB;
    });

  if (items.length === 0) {
    return [];
  }

  let currentParagraphTextRuns: FormattedTextRun[] = [];
  let currentParagraphFirstItemX: number = 0; // Initialize, will be set on first item or new paragraph start
  let lastItemY: number | null = null;
  let lastItemX: number | null = null;
  let lastItemRightEdge: number | null = null;
  let lastItemFontSize: number | null = null;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const itemY = item.transform[5];
    const itemX = item.transform[4];
    const itemText = item.str;
    const itemFontSize = item.height;

    const isBold = item.fontName?.toLowerCase().includes('bold') || false;
    const isItalic = item.fontName?.toLowerCase().includes('italic') || false;

    const estimatedLineHeight =
      lastItemFontSize !== null
        ? lastItemFontSize * PARAGRAPH_GAP_FACTOR
        : itemFontSize * PARAGRAPH_GAP_FACTOR;

    let shouldStartNewParagraph = false;

    if (lastItemY === null) {
      shouldStartNewParagraph = true;
    } else {
      const verticalGap = lastItemY - itemY;
      const horizontalShift = itemX - lastItemX!; // How much current item shifted horizontally from last item's start

      if (verticalGap > estimatedLineHeight) {
        shouldStartNewParagraph = true;
      } else if (
        verticalGap > SAME_LINE_VERTICAL_TOLERANCE &&
        horizontalShift < -INDENTATION_THRESHOLD
      ) {
        shouldStartNewParagraph = true;
      } else if (
        verticalGap > SAME_LINE_VERTICAL_TOLERANCE &&
        lastItemFontSize !== null &&
        Math.abs(itemFontSize - lastItemFontSize) > FONT_SIZE_CHANGE_THRESHOLD
      ) {
        shouldStartNewParagraph = true;
      } else if (
        currentParagraphTextRuns.length > 0 &&
        currentParagraphTextRuns[currentParagraphTextRuns.length - 1].text
          .trim()
          .match(/[.?!:;]$/) &&
        verticalGap > SAME_LINE_VERTICAL_TOLERANCE &&
        verticalGap < estimatedLineHeight * 0.8
      ) {
        shouldStartNewParagraph = true;
      } else if (
        itemX > pageActualWidth * 0.6 &&
        verticalGap > SAME_LINE_VERTICAL_TOLERANCE
      ) {
        shouldStartNewParagraph = true;
      }
    }

    if (shouldStartNewParagraph) {
      if (currentParagraphTextRuns.length > 0) {
        const childrenRuns = currentParagraphTextRuns.map((ftr) => ftr.run);
        docxParagraphs.push(
          new Paragraph({
            children: childrenRuns,
            alignment: detectAlignment(
              currentParagraphFirstItemX,
              pageActualWidth
            ),
            spacing: { after: 150 }
          })
        );
      }
      currentParagraphTextRuns = [];
      currentParagraphFirstItemX = itemX; // Set the first item's X for the new paragraph
    }

    const newTextRun = new TextRun({
      text: itemText.trimEnd(),
      bold: isBold,
      italics: isItalic,
      size: Math.round(itemFontSize * 2)
    });
    currentParagraphTextRuns.push({
      run: newTextRun,
      text: itemText.trimEnd()
    });

    // --- Add space between text items within the same logical paragraph if on the same line ---
    // Removed the problematic explicit newline insertion here.
    if (i + 1 < items.length) {
      const nextItem = items[i + 1];
      const nextItemY = nextItem.transform[5];
      const nextItemX = nextItem.transform[4];

      const currentItemRightEdge = item.transform[4] + item.width;
      const verticalDifference = itemY - nextItemY;

      const isSameVisualLine =
        Math.abs(verticalDifference) < SAME_LINE_VERTICAL_TOLERANCE;
      const horizontalGap = nextItemX - currentItemRightEdge;

      if (isSameVisualLine) {
        if (
          horizontalGap > itemFontSize * 0.2 &&
          horizontalGap < itemFontSize * 2
        ) {
          currentParagraphTextRuns.push({
            run: new TextRun({ text: ' ' }),
            text: ' '
          });
        }
      }
    }

    lastItemY = itemY;
    lastItemX = itemX;
    lastItemRightEdge = item.transform[4] + item.width;
    lastItemFontSize = itemFontSize;
  }

  if (currentParagraphTextRuns.length > 0) {
    const childrenRuns = currentParagraphTextRuns.map((ftr) => ftr.run);
    docxParagraphs.push(
      new Paragraph({
        children: childrenRuns,
        alignment: detectAlignment(currentParagraphFirstItemX, pageActualWidth),
        spacing: { after: 150 }
      })
    );
  }

  return docxParagraphs;
}

function detectAlignment(
  x_coord: number,
  pageActualWidth: number
): DocxAlignmentValue {
  const currentLeftThreshold =
    LEFT_MARGIN_THRESHOLD * (pageActualWidth / PAGE_WIDTH_APPROX);
  const currentRightThreshold =
    RIGHT_MARGIN_THRESHOLD * (pageActualWidth / PAGE_WIDTH_APPROX);
  const currentCenterRange =
    CENTER_RANGE * (pageActualWidth / PAGE_WIDTH_APPROX);
  const current_page_center = pageActualWidth / 2;

  if (x_coord < currentLeftThreshold) {
    return AlignmentType.LEFT;
  }
  if (x_coord > currentRightThreshold) {
    return AlignmentType.RIGHT;
  }
  if (Math.abs(x_coord - current_page_center) < currentCenterRange) {
    return AlignmentType.CENTER;
  }
  return AlignmentType.LEFT;
}
