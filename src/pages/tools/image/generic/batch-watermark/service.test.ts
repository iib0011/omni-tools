import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  filenameToWatermarkText,
  outputSpecForFile,
  processImage
} from './service';

describe('batch-watermark service', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    // cleanup stubGlobal
    // @ts-expect-error optional cleanup
    delete globalThis.createImageBitmap;
  });

  it('filenameToWatermarkText strips extension and prettifies', () => {
    expect(filenameToWatermarkText('goose.png')).toBe('goose');

    expect(filenameToWatermarkText('duck_photo-01.jpeg')).toBe('duck photo 01');

    expect(filenameToWatermarkText('  __weird--name__.webp  ')).toBe(
      'weird name'
    );
  });

  it('outputSpecForFile preserves supported types and defaults unknown to PNG', () => {
    const png = new File([new Uint8Array([1])], 'goose.png', {
      type: 'image/png'
    });

    const jpg = new File([new Uint8Array([1])], 'duck.jpeg', {
      type: 'image/jpeg'
    });

    const webp = new File([new Uint8Array([1])], 'bird.webp', {
      type: 'image/webp'
    });

    const unknown = new File([new Uint8Array([1])], 'mystery.bin', {
      type: 'application/octet-stream'
    });

    expect(outputSpecForFile(png)).toMatchObject({
      outputType: 'image/png',
      ext: 'png'
    });

    expect(outputSpecForFile(jpg)).toMatchObject({
      outputType: 'image/jpeg',
      ext: 'jpeg',
      quality: 0.92
    });

    expect(outputSpecForFile(webp)).toMatchObject({
      outputType: 'image/webp',
      ext: 'webp'
    });

    expect(outputSpecForFile(unknown)).toMatchObject({
      outputType: 'image/png',
      ext: 'png'
    });
  });

  it('processImage returns a watermarked file and uses filename as text', async () => {
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(async () => ({
        width: 200,
        height: 100
      }))
    );

    const fillText = vi.fn();
    const drawImage = vi.fn();
    const save = vi.fn();
    const restore = vi.fn();

    const ctxMock: any = {
      drawImage,
      save,
      restore,
      fillText,
      globalAlpha: 1,
      fillStyle: '',
      font: '',
      textAlign: 'left',
      textBaseline: 'alphabetic',
      shadowColor: '',
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0
    };

    const canvasMock: any = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ctxMock),
      toBlob: vi.fn((cb: (b: Blob | null) => void) => {
        cb(
          new Blob([new Uint8Array([2, 3, 4])], {
            type: 'image/png'
          })
        );
      })
    };

    const originalCreateElement = document.createElement.bind(document);

    vi.spyOn(document, 'createElement').mockImplementation((tagName: any) => {
      if (tagName === 'canvas') return canvasMock;
      return originalCreateElement(tagName);
    });

    const file = new File([new Uint8Array([9])], 'goose.png', {
      type: 'image/png'
    });

    const out = await processImage(file, {
      watermarkOpacity: 0.35,
      fontSize: 32,
      position: 'bottom-right',
      color: '#ffffff'
    });

    expect(out).not.toBeNull();

    expect(out!.name).toBe('goose_watermarked.png');

    expect(out!.type).toBe('image/png');

    expect(drawImage).toHaveBeenCalled();

    expect(fillText).toHaveBeenCalled();

    const [textArg] = fillText.mock.calls[0];

    expect(textArg).toBe('goose');
  });

  it('processImage preserves jpeg output naming and type', async () => {
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(async () => ({
        width: 100,
        height: 100
      }))
    );

    const ctxMock: any = {
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      fillText: vi.fn()
    };

    const canvasMock: any = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ctxMock),
      toBlob: vi.fn((cb: (b: Blob | null) => void) => {
        cb(
          new Blob([new Uint8Array([1])], {
            type: 'image/jpeg'
          })
        );
      })
    };

    const originalCreateElement = document.createElement.bind(document);

    vi.spyOn(document, 'createElement').mockImplementation((tagName: any) => {
      if (tagName === 'canvas') return canvasMock;
      return originalCreateElement(tagName);
    });

    const file = new File([new Uint8Array([9])], 'duck.jpeg', {
      type: 'image/jpeg'
    });

    const out = await processImage(file, {
      watermarkOpacity: 0.4,
      fontSize: 20,
      position: 'top-left',
      color: '#ffffff'
    });

    expect(out).not.toBeNull();

    expect(out!.name).toBe('duck_watermarked.jpeg');

    expect(out!.type).toBe('image/jpeg');
  });
});
