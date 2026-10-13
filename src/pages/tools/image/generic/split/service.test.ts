import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  PDFDict,
  PDFDocument,
  PDFName,
  PDFNumber,
  PDFStream,
  PageSizes
} from 'pdf-lib';
import Jimp from 'jimp';
import { splitImagesToPDF } from './service';
import { InitialValuesType } from './types';

const values: InitialValuesType = {
  pageFormat: 'A4',
  pageWidth: 210,
  pageHeight: 297,
  pxPerSquareQuantity: 1620,
  squareQuantity: 20,
  unitsPerOneSquare: 25.4,
  unitKind: 'mm',
  padding: 5
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('splitImagesToPDF', () => {
  test.each([
    ['partial bottom row', 1, 1.25],
    ['partial right column', 1.25, 1],
    ['partial bottom-right corner', 1.25, 1.25],
    ['image smaller than one page', 0.25, 0.25],
    ['complete pages', 2, 2]
  ])('preserves scale for %s', async (_name, columns, rows) => {
    const [pageWidth, pageHeight] = PageSizes.A4;
    const padding = (values.padding * 72) / 25.4;
    const pxPerPt = 1620 / (72 * 20);
    const tileWidth = Math.round((pageWidth - 2 * padding) * pxPerPt);
    const tileHeight = Math.round((pageHeight - 2 * padding) * pxPerPt);
    const width = Math.floor(tileWidth * columns);
    const height = Math.floor(tileHeight * rows);

    vi.stubGlobal(
      'Image',
      class {
        width = width;
        height = height;
        onload?: () => void;
        set src(_value: string) {
          queueMicrotask(() => this.onload?.());
        }
      }
    );
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    // happy-dom has no canvas renderer; encode its allocated dimensions as PNG.
    const createElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag !== 'canvas') return createElement(tag);
      const canvas = {
        width: 0,
        height: 0,
        getContext: () => ({ drawImage: vi.fn() }),
        toBlob(callback: BlobCallback) {
          new Jimp(canvas.width, canvas.height, 0)
            .getBufferAsync(Jimp.MIME_PNG)
            .then((bytes) =>
              callback(new Blob([new Uint8Array(bytes)], { type: 'image/png' }))
            );
        }
      };
      return canvas as unknown as HTMLCanvasElement;
    });

    const result = await splitImagesToPDF(new File([], 'poster.png'), values);
    expect(result.type).toBe('application/pdf');
    const pdf = await PDFDocument.load(await result.arrayBuffer());
    expect(pdf.getPageCount()).toBe(Math.ceil(columns) * Math.ceil(rows));
    for (const page of pdf.getPages()) {
      expect(page.getSize()).toEqual({ width: pageWidth, height: pageHeight });
      const images = page.node
        .Resources()!
        .lookup(PDFName.of('XObject'), PDFDict);
      const image = images.lookup(images.keys()[0], PDFStream);
      // Every PNG must cover the same pixel grid, including blank edge space.
      // Otherwise drawing it across the printable area stretches the remainder.
      expect(image.dict.lookup(PDFName.of('Width'), PDFNumber).asNumber()).toBe(
        tileWidth
      );
      expect(
        image.dict.lookup(PDFName.of('Height'), PDFNumber).asNumber()
      ).toBe(tileHeight);
    }
  });
});
