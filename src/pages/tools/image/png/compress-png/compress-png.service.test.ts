import { describe, expect, it } from 'vitest';
import Jimp from 'jimp';
import { compressPngPixels } from './service';
import { InitialValuesType } from './types';

const WIDTH = 120;
const HEIGHT = 90;

const defaultOptions: InitialValuesType = {
  quality: 60,
  dithering: false,
  maxOutputSizeInKB: 0
};

/** A noisy gradient: enough distinct colors that a palette actually helps. */
function gradient(): Uint8ClampedArray {
  const pixels = new Uint8ClampedArray(WIDTH * HEIGHT * 4);
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const p = (y * WIDTH + x) * 4;
      pixels[p] = (x * 255) / WIDTH;
      pixels[p + 1] = (y * 255) / HEIGHT;
      pixels[p + 2] = (x * y) % 256;
      pixels[p + 3] = 255;
    }
  }
  return pixels;
}

async function readBack(data: Uint8Array) {
  return Jimp.read(Buffer.from(data));
}

describe('compressPngPixels', () => {
  it('keeps the original dimensions', async () => {
    const { data } = await compressPngPixels(
      gradient(),
      WIDTH,
      HEIGHT,
      defaultOptions
    );

    const image = await readBack(data);
    expect(image.bitmap.width).toBe(WIDTH);
    expect(image.bitmap.height).toBe(HEIGHT);
  });

  it('produces a smaller file than the raw pixels', async () => {
    const pixels = gradient();
    const { data } = await compressPngPixels(
      pixels,
      WIDTH,
      HEIGHT,
      defaultOptions
    );

    expect(data.length).toBeLessThan(pixels.length);
  });

  it('keeps colors close to the original ones', async () => {
    const { data } = await compressPngPixels(gradient(), WIDTH, HEIGHT, {
      ...defaultOptions,
      quality: 100
    });

    const image = await readBack(data);
    const original = gradient();
    let worstDelta = 0;
    for (let y = 0; y < HEIGHT; y += 7) {
      for (let x = 0; x < WIDTH; x += 7) {
        const p = (y * WIDTH + x) * 4;
        const { r, g, b } = Jimp.intToRGBA(image.getPixelColor(x, y));
        worstDelta = Math.max(
          worstDelta,
          Math.abs(r - original[p]),
          Math.abs(g - original[p + 1]),
          Math.abs(b - original[p + 2])
        );
      }
    }

    expect(worstDelta).toBeLessThan(40);
  });

  it('lowers the palette until the size budget is met', async () => {
    const budgetInKB = 3;
    const result = await compressPngPixels(gradient(), WIDTH, HEIGHT, {
      ...defaultOptions,
      quality: 100,
      maxOutputSizeInKB: budgetInKB
    });

    expect(result.targetReached).toBe(true);
    expect(result.data.length).toBeLessThanOrEqual(budgetInKB * 1024);
    expect(result.colors).toBeLessThan(256);
  });

  it('preserves fully transparent pixels', async () => {
    const pixels = gradient();
    for (let i = 3; i < pixels.length; i += 4) {
      if (i < (pixels.length / 4) * 2) pixels[i] = 0;
    }

    const { data } = await compressPngPixels(
      pixels,
      WIDTH,
      HEIGHT,
      defaultOptions
    );

    const image = await readBack(data);
    expect(Jimp.intToRGBA(image.getPixelColor(0, 0)).a).toBe(0);
    expect(Jimp.intToRGBA(image.getPixelColor(WIDTH - 1, HEIGHT - 1)).a).toBe(
      255
    );
  });

  it('supports palettes below 8 bits per pixel', async () => {
    const result = await compressPngPixels(gradient(), WIDTH, HEIGHT, {
      ...defaultOptions,
      quality: 1
    });

    const image = await readBack(result.data);
    expect(image.bitmap.width).toBe(WIDTH);
    expect(result.colors).toBeLessThanOrEqual(3);
  });
});
