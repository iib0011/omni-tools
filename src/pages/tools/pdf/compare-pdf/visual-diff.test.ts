import { describe, expect, it, vi } from 'vitest';
import {
  InvalidPixelBufferError,
  PixelComparisonCancelledError,
  comparePixelBuffers
} from './visual-diff';

function rgba(...pixels: Array<[number, number, number, number]>) {
  return new Uint8ClampedArray(pixels.flat());
}

describe('comparePixelBuffers', () => {
  it('reports an exact zero difference and an empty mask for identical pixels', async () => {
    const pixels = rgba([255, 255, 255, 255], [0, 0, 0, 255]);

    const result = await comparePixelBuffers({
      pixelsA: pixels,
      pixelsB: pixels.slice(),
      width: 2,
      height: 1,
      tolerance: 0
    });

    expect(result).toMatchObject({
      changedPixels: 0,
      totalPixels: 2,
      changedPercentage: 0
    });
    expect(Array.from(result.differenceMask)).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('ignores channel changes at the tolerance and marks changes above it', async () => {
    const result = await comparePixelBuffers({
      pixelsA: rgba([100, 100, 100, 255], [100, 100, 100, 255]),
      pixelsB: rgba([108, 100, 100, 255], [109, 100, 100, 255]),
      width: 2,
      height: 1,
      tolerance: 8
    });

    expect(result.changedPixels).toBe(1);
    expect(result.changedPercentage).toBe(50);
    expect(Array.from(result.differenceMask)).toEqual([
      0, 0, 0, 0, 229, 57, 53, 230
    ]);
  });

  it('treats transparent padding as a page-size difference', async () => {
    const result = await comparePixelBuffers({
      pixelsA: rgba([255, 255, 255, 255]),
      pixelsB: rgba([0, 0, 0, 0]),
      width: 1,
      height: 1,
      tolerance: 64
    });

    expect(result.changedPixels).toBe(1);
    expect(result.changedPercentage).toBe(100);
  });

  it('reports row-level progress and yields between chunks', async () => {
    const onProgress = vi.fn();
    const yieldToEventLoop = vi.fn(async () => undefined);
    const pixels = new Uint8ClampedArray(3 * 2 * 4);

    await comparePixelBuffers(
      {
        pixelsA: pixels,
        pixelsB: pixels.slice(),
        width: 2,
        height: 3,
        tolerance: 0
      },
      {
        rowsPerChunk: 1,
        onProgress,
        yieldToEventLoop
      }
    );

    expect(onProgress.mock.calls).toEqual([
      [0, 3],
      [1, 3],
      [2, 3],
      [3, 3]
    ]);
    expect(yieldToEventLoop).toHaveBeenCalledTimes(2);
  });

  it('cancels before processing a subsequent chunk', async () => {
    let cancelled = false;

    await expect(
      comparePixelBuffers(
        {
          pixelsA: new Uint8ClampedArray(2 * 2 * 4),
          pixelsB: new Uint8ClampedArray(2 * 2 * 4),
          width: 2,
          height: 2,
          tolerance: 0
        },
        {
          rowsPerChunk: 1,
          shouldCancel: () => cancelled,
          yieldToEventLoop: async () => {
            cancelled = true;
          }
        }
      )
    ).rejects.toBeInstanceOf(PixelComparisonCancelledError);
  });

  it('rejects buffers that do not match the declared dimensions', async () => {
    await expect(
      comparePixelBuffers({
        pixelsA: new Uint8ClampedArray(4),
        pixelsB: new Uint8ClampedArray(4),
        width: 2,
        height: 1,
        tolerance: 0
      })
    ).rejects.toBeInstanceOf(InvalidPixelBufferError);
  });
});
