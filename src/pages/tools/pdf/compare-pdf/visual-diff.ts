export interface PixelComparisonInput {
  pixelsA: Uint8ClampedArray;
  pixelsB: Uint8ClampedArray;
  width: number;
  height: number;
  tolerance: number;
}

export interface PixelComparisonOptions {
  rowsPerChunk?: number;
  onProgress?: (completedRows: number, totalRows: number) => void;
  shouldCancel?: () => boolean;
  yieldToEventLoop?: () => Promise<void>;
}

export interface PixelComparisonResult {
  changedPixels: number;
  totalPixels: number;
  changedPercentage: number;
  differenceMask: Uint8ClampedArray;
}

export class InvalidPixelBufferError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPixelBufferError';
  }
}

export class PixelComparisonCancelledError extends Error {
  constructor() {
    super('Visual comparison was cancelled.');
    this.name = 'PixelComparisonCancelledError';
  }
}

function validateInput({
  pixelsA,
  pixelsB,
  width,
  height,
  tolerance
}: PixelComparisonInput): void {
  if (!Number.isInteger(width) || !Number.isInteger(height)) {
    throw new InvalidPixelBufferError(
      'Visual comparison dimensions must be whole numbers.'
    );
  }
  if (width <= 0 || height <= 0) {
    throw new InvalidPixelBufferError(
      'Visual comparison dimensions must be greater than zero.'
    );
  }
  if (!Number.isFinite(tolerance) || tolerance < 0 || tolerance > 255) {
    throw new InvalidPixelBufferError(
      'Visual comparison tolerance must be between 0 and 255.'
    );
  }

  const expectedLength = width * height * 4;
  if (
    pixelsA.byteLength !== expectedLength ||
    pixelsB.byteLength !== expectedLength
  ) {
    throw new InvalidPixelBufferError(
      `Expected two RGBA buffers of ${expectedLength} bytes.`
    );
  }
}

function pixelChanged(
  pixelsA: Uint8ClampedArray,
  pixelsB: Uint8ClampedArray,
  offset: number,
  tolerance: number
): boolean {
  return (
    Math.abs(pixelsA[offset] - pixelsB[offset]) > tolerance ||
    Math.abs(pixelsA[offset + 1] - pixelsB[offset + 1]) > tolerance ||
    Math.abs(pixelsA[offset + 2] - pixelsB[offset + 2]) > tolerance ||
    Math.abs(pixelsA[offset + 3] - pixelsB[offset + 3]) > tolerance
  );
}

function writeMaskPixel(
  mask: Uint8ClampedArray,
  offset: number,
  changed: boolean
): void {
  if (!changed) {
    mask[offset] = 0;
    mask[offset + 1] = 0;
    mask[offset + 2] = 0;
    mask[offset + 3] = 0;
    return;
  }

  mask[offset] = 229;
  mask[offset + 1] = 57;
  mask[offset + 2] = 53;
  mask[offset + 3] = 230;
}

function defaultYield(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

export async function comparePixelBuffers(
  input: PixelComparisonInput,
  options: PixelComparisonOptions = {}
): Promise<PixelComparisonResult> {
  validateInput(input);

  const { pixelsA, pixelsB, width, height, tolerance } = input;
  const rowsPerChunk = Math.max(
    1,
    Math.min(height, Math.trunc(options.rowsPerChunk ?? 32))
  );
  const differenceMask = new Uint8ClampedArray(pixelsA.byteLength);
  let changedPixels = 0;

  options.onProgress?.(0, height);

  for (let startRow = 0; startRow < height; startRow += rowsPerChunk) {
    if (options.shouldCancel?.()) {
      throw new PixelComparisonCancelledError();
    }

    const endRow = Math.min(height, startRow + rowsPerChunk);
    const startOffset = startRow * width * 4;
    const endOffset = endRow * width * 4;

    for (let offset = startOffset; offset < endOffset; offset += 4) {
      const changed = pixelChanged(pixelsA, pixelsB, offset, tolerance);
      if (changed) {
        changedPixels += 1;
      }
      writeMaskPixel(differenceMask, offset, changed);
    }

    options.onProgress?.(endRow, height);

    if (endRow < height) {
      await (options.yieldToEventLoop ?? defaultYield)();
    }
  }

  const totalPixels = width * height;
  return {
    changedPixels,
    totalPixels,
    changedPercentage:
      totalPixels === 0 ? 0 : (changedPixels / totalPixels) * 100,
    differenceMask
  };
}
