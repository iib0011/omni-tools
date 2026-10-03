import { InitialValuesType } from './types';

export interface CompressPngResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  /** Width of the output, always identical to the width of the input. */
  width: number;
  /** Height of the output, always identical to the height of the input. */
  height: number;
  /** Number of colors kept in the output palette. */
  colors: number;
  /** False when the size budget could not be met even with a 2 color palette. */
  targetReached: boolean;
  /** True when the input was already smaller than anything we could produce. */
  keptOriginal: boolean;
}

const MAX_PALETTE_SIZE = 256;

/**
 * Compresses a PNG by reducing its color palette, never its dimensions.
 *
 * The picture is decoded at its native size, quantized to a palette and
 * re-encoded as an indexed PNG, which is where the size savings come from.
 * Width and height are carried over untouched.
 */
export async function compressPng(
  file: File,
  options: InitialValuesType
): Promise<CompressPngResult> {
  const { data, width, height } = await decodeImage(file);
  const compressed = await compressPngPixels(data, width, height, options);

  // An already optimized PNG can be smaller than our best attempt. Handing
  // back a heavier file would be worse than doing nothing at all.
  const keptOriginal = compressed.data.length >= file.size;
  const targetBytes = Math.max(0, Math.round(options.maxOutputSizeInKB * 1024));

  return {
    file: keptOriginal
      ? file
      : new File([new Uint8Array(compressed.data)], file.name, {
          type: 'image/png'
        }),
    originalSize: file.size,
    compressedSize: keptOriginal ? file.size : compressed.data.length,
    width,
    height,
    colors: compressed.colors,
    targetReached: keptOriginal
      ? !targetBytes || file.size <= targetBytes
      : compressed.targetReached,
    keptOriginal
  };
}

/**
 * Palette-compresses raw RGBA pixels into a PNG byte stream. The pixels are
 * read and normalized in place. Exposed separately from {@link compressPng}
 * so it can run without a DOM.
 */
export async function compressPngPixels(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  options: InitialValuesType
): Promise<{ data: Uint8Array; colors: number; targetReached: boolean }> {
  if (width <= 0 || height <= 0) {
    throw new Error('The picture has no pixels to compress');
  }

  // Fully transparent pixels can hold any RGB value. Flattening them to a
  // single color removes noise the palette would otherwise waste entries on.
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] === 0) {
      pixels[i] = 0;
      pixels[i + 1] = 0;
      pixels[i + 2] = 0;
    }
  }

  const histogram = buildHistogram(pixels);
  const targetBytes = Math.max(0, Math.round(options.maxOutputSizeInKB * 1024));

  let output: { data: Uint8Array; colors: number } | null = null;
  for (const paletteSize of paletteSizes(options.quality, targetBytes)) {
    const palette = buildPalette(histogram, paletteSize);
    const indices = mapToPalette(pixels, width, height, palette, {
      dithering: options.dithering
    });
    output = {
      data: await encodeIndexedPng(indices, width, height, palette),
      colors: palette.size
    };
    if (!targetBytes || output.data.length <= targetBytes) break;
  }

  if (!output) throw new Error('The picture could not be compressed');

  return {
    ...output,
    targetReached: !targetBytes || output.data.length <= targetBytes
  };
}

/**
 * Palette sizes to try, largest first. Without a size budget the quality
 * setting alone decides; with one, we keep halving the palette until the
 * output fits.
 */
function paletteSizes(quality: number, targetBytes: number): number[] {
  const clamped = Math.min(100, Math.max(1, Math.round(quality || 0)));
  const requested = Math.max(2, Math.round((clamped / 100) * MAX_PALETTE_SIZE));

  if (!targetBytes) return [requested];

  const fallbacks = [128, 64, 32, 16, 8, 4, 2].filter((n) => n < requested);
  return [requested, ...fallbacks];
}

/* -------------------------------------------------------------------------- */
/* Decoding                                                                   */
/* -------------------------------------------------------------------------- */

async function decodeImage(file: File): Promise<ImageData> {
  const source = await loadImageSource(file);
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas is not supported in this browser');

  ctx.drawImage(source.image, 0, 0);
  if (typeof ImageBitmap !== 'undefined' && source.image instanceof ImageBitmap)
    source.image.close();

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

async function loadImageSource(
  file: File
): Promise<{ image: CanvasImageSource; width: number; height: number }> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file);
    return { image: bitmap, width: bitmap.width, height: bitmap.height };
  }

  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('The PNG could not be read'));
      element.src = url;
    });
    return {
      image,
      width: image.naturalWidth,
      height: image.naturalHeight
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/* -------------------------------------------------------------------------- */
/* Color quantization                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Population of the picture bucketed by color. Channels are bucketed on 6 bits
 * to keep the map small, while the exact channel sums are kept so palette
 * entries stay accurate.
 */
interface Histogram {
  count: number[];
  rSum: number[];
  gSum: number[];
  bSum: number[];
  aSum: number[];
}

interface Palette {
  size: number;
  r: Uint8Array;
  g: Uint8Array;
  b: Uint8Array;
  a: Uint8Array;
  /** Number of leading entries that are not fully opaque. */
  transparentEntries: number;
}

function buildHistogram(pixels: Uint8ClampedArray): Histogram {
  const buckets = new Map<number, number>();
  const histogram: Histogram = {
    count: [],
    rSum: [],
    gSum: [],
    bSum: [],
    aSum: []
  };

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    const key =
      ((r >> 2) << 18) | ((g >> 2) << 12) | ((b >> 2) << 6) | (a >> 2);

    let bucket = buckets.get(key);
    if (bucket === undefined) {
      bucket = histogram.count.length;
      buckets.set(key, bucket);
      histogram.count.push(0);
      histogram.rSum.push(0);
      histogram.gSum.push(0);
      histogram.bSum.push(0);
      histogram.aSum.push(0);
    }

    histogram.count[bucket]++;
    histogram.rSum[bucket] += r;
    histogram.gSum[bucket] += g;
    histogram.bSum[bucket] += b;
    histogram.aSum[bucket] += a;
  }

  return histogram;
}

interface Box {
  members: number[];
  count: number;
  axis: number;
  range: number;
  priority: number;
}

/** Median cut over the histogram, weighted by how common each color is. */
function buildPalette(histogram: Histogram, maxColors: number): Palette {
  const bucketCount = histogram.count.length;
  const centers = new Float32Array(bucketCount * 4);
  for (let i = 0; i < bucketCount; i++) {
    const count = histogram.count[i];
    centers[i * 4] = histogram.rSum[i] / count;
    centers[i * 4 + 1] = histogram.gSum[i] / count;
    centers[i * 4 + 2] = histogram.bSum[i] / count;
    centers[i * 4 + 3] = histogram.aSum[i] / count;
  }

  const allMembers = Array.from({ length: bucketCount }, (_, i) => i);
  const boxes = [makeBox(allMembers, histogram, centers)];

  while (boxes.length < maxColors) {
    let target = -1;
    for (let i = 0; i < boxes.length; i++) {
      if (boxes[i].range <= 0) continue;
      if (target === -1 || boxes[i].priority > boxes[target].priority)
        target = i;
    }
    if (target === -1) break;

    const [first, second] = splitBox(boxes[target], histogram, centers);
    boxes.splice(target, 1, first, second);
  }

  return paletteFromBoxes(boxes, histogram);
}

function makeBox(
  members: number[],
  histogram: Histogram,
  centers: Float32Array
): Box {
  const min = [255, 255, 255, 255];
  const max = [0, 0, 0, 0];
  let count = 0;

  for (const member of members) {
    count += histogram.count[member];
    for (let channel = 0; channel < 4; channel++) {
      const value = centers[member * 4 + channel];
      if (value < min[channel]) min[channel] = value;
      if (value > max[channel]) max[channel] = value;
    }
  }

  let axis = 0;
  let range = 0;
  for (let channel = 0; channel < 4; channel++) {
    const channelRange = max[channel] - min[channel];
    if (channelRange > range) {
      range = channelRange;
      axis = channel;
    }
  }

  return {
    members,
    count,
    axis,
    range,
    // Volume times population: splits the box that hurts the picture most.
    priority: range * count
  };
}

function splitBox(
  box: Box,
  histogram: Histogram,
  centers: Float32Array
): [Box, Box] {
  const sorted = [...box.members].sort(
    (left, right) =>
      centers[left * 4 + box.axis] - centers[right * 4 + box.axis]
  );

  // Cut where half of the pixels of the box lie, so both halves matter equally.
  const half = box.count / 2;
  let accumulated = 0;
  let splitAt = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    accumulated += histogram.count[sorted[i]];
    splitAt = i + 1;
    if (accumulated >= half) break;
  }

  return [
    makeBox(sorted.slice(0, splitAt), histogram, centers),
    makeBox(sorted.slice(splitAt), histogram, centers)
  ];
}

/**
 * Averages every box into one palette entry, then orders the palette so the
 * see-through entries come first — that keeps the tRNS chunk as short as
 * possible.
 */
function paletteFromBoxes(boxes: Box[], histogram: Histogram): Palette {
  const entries = boxes
    .filter((box) => box.count > 0)
    .map((box) => {
      let count = 0;
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (const member of box.members) {
        count += histogram.count[member];
        r += histogram.rSum[member];
        g += histogram.gSum[member];
        b += histogram.bSum[member];
        a += histogram.aSum[member];
      }
      return {
        r: Math.round(r / count),
        g: Math.round(g / count),
        b: Math.round(b / count),
        a: Math.round(a / count)
      };
    });

  entries.sort(
    (left, right) =>
      Number(left.a === 255) - Number(right.a === 255) || left.a - right.a
  );

  const size = Math.max(1, entries.length);
  const palette: Palette = {
    size,
    r: new Uint8Array(size),
    g: new Uint8Array(size),
    b: new Uint8Array(size),
    a: new Uint8Array(size),
    transparentEntries: entries.filter((entry) => entry.a !== 255).length
  };

  entries.forEach((entry, index) => {
    palette.r[index] = entry.r;
    palette.g[index] = entry.g;
    palette.b[index] = entry.b;
    palette.a[index] = entry.a;
  });

  return palette;
}

/* -------------------------------------------------------------------------- */
/* Palette mapping                                                            */
/* -------------------------------------------------------------------------- */

function mapToPalette(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  palette: Palette,
  { dithering }: { dithering: boolean }
): Uint8Array {
  const indices = new Uint8Array(width * height);
  // Cache of nearest matches, keyed on the color rounded to 5/5/5/4 bits.
  const cache = new Int16Array(1 << 19).fill(-1);

  const nearest = (r: number, g: number, b: number, a: number): number => {
    const key = ((r >> 3) << 14) | ((g >> 3) << 9) | ((b >> 3) << 4) | (a >> 4);
    const cached = cache[key];
    if (cached >= 0) return cached;

    let best = 0;
    let bestDistance = Infinity;
    for (let i = 0; i < palette.size; i++) {
      const dr = r - palette.r[i];
      const dg = g - palette.g[i];
      const db = b - palette.b[i];
      const da = a - palette.a[i];
      // Alpha is weighted up: a wrong opacity is more visible than a wrong hue.
      const distance = dr * dr + dg * dg + db * db + 3 * da * da;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    }

    cache[key] = best;
    return best;
  };

  if (!dithering) {
    for (let i = 0; i < indices.length; i++) {
      const p = i * 4;
      indices[i] = nearest(
        pixels[p],
        pixels[p + 1],
        pixels[p + 2],
        pixels[p + 3]
      );
    }
    return indices;
  }

  // Floyd-Steinberg: the error of each pixel is pushed onto its neighbors.
  // Rows are padded by one pixel on each side so the x-1 spill needs no bounds
  // check.
  let currentRow = new Float32Array((width + 2) * 4);
  let nextRow = new Float32Array((width + 2) * 4);
  const errors = new Float32Array(4);

  for (let y = 0; y < height; y++) {
    nextRow.fill(0);

    for (let x = 0; x < width; x++) {
      const p = (y * width + x) * 4;
      const e = (x + 1) * 4;

      const r = clampChannel(pixels[p] + currentRow[e]);
      const g = clampChannel(pixels[p + 1] + currentRow[e + 1]);
      const b = clampChannel(pixels[p + 2] + currentRow[e + 2]);
      const a = clampChannel(pixels[p + 3] + currentRow[e + 3]);

      const index = nearest(r, g, b, a);
      indices[y * width + x] = index;

      errors[0] = r - palette.r[index];
      errors[1] = g - palette.g[index];
      errors[2] = b - palette.b[index];
      errors[3] = a - palette.a[index];

      for (let channel = 0; channel < 4; channel++) {
        const error = errors[channel];
        if (error === 0) continue;
        currentRow[e + 4 + channel] += (error * 7) / 16;
        nextRow[e - 4 + channel] += (error * 3) / 16;
        nextRow[e + channel] += (error * 5) / 16;
        nextRow[e + 4 + channel] += error / 16;
      }
    }

    const done = currentRow;
    currentRow = nextRow;
    nextRow = done;
  }

  return indices;
}

function clampChannel(value: number): number {
  if (value <= 0) return 0;
  if (value >= 255) return 255;
  return Math.round(value);
}

/* -------------------------------------------------------------------------- */
/* PNG encoding                                                               */
/* -------------------------------------------------------------------------- */

const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

async function encodeIndexedPng(
  indices: Uint8Array,
  width: number,
  height: number,
  palette: Palette
): Promise<Uint8Array> {
  const bitDepth = paletteBitDepth(palette.size);
  const idat = await deflate(scanlines(indices, width, height, bitDepth));

  const ihdr = new Uint8Array(13);
  const header = new DataView(ihdr.buffer);
  header.setUint32(0, width);
  header.setUint32(4, height);
  ihdr[8] = bitDepth;
  ihdr[9] = 3; // color type 3: indexed
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // adaptive filtering
  ihdr[12] = 0; // no interlacing

  const plte = new Uint8Array(palette.size * 3);
  for (let i = 0; i < palette.size; i++) {
    plte[i * 3] = palette.r[i];
    plte[i * 3 + 1] = palette.g[i];
    plte[i * 3 + 2] = palette.b[i];
  }

  const chunks = [PNG_SIGNATURE, chunk('IHDR', ihdr), chunk('PLTE', plte)];
  if (palette.transparentEntries > 0) {
    chunks.push(chunk('tRNS', palette.a.slice(0, palette.transparentEntries)));
  }
  chunks.push(chunk('IDAT', idat), chunk('IEND', new Uint8Array(0)));

  return concat(chunks);
}

function paletteBitDepth(colors: number): 1 | 2 | 4 | 8 {
  if (colors <= 2) return 1;
  if (colors <= 4) return 2;
  if (colors <= 16) return 4;
  return 8;
}

/** Packs the indices into PNG scanlines, each prefixed by its filter byte. */
function scanlines(
  indices: Uint8Array,
  width: number,
  height: number,
  bitDepth: number
): Uint8Array {
  const bytesPerRow = Math.ceil((width * bitDepth) / 8);
  const raw = new Uint8Array((bytesPerRow + 1) * height);
  const perByte = 8 / bitDepth;

  for (let y = 0; y < height; y++) {
    const rowStart = y * (bytesPerRow + 1);
    raw[rowStart] = 0; // filter 0: indexed data does not gain from filtering

    if (bitDepth === 8) {
      raw.set(indices.subarray(y * width, (y + 1) * width), rowStart + 1);
      continue;
    }

    for (let x = 0; x < width; x++) {
      const shift = 8 - bitDepth * ((x % perByte) + 1);
      raw[rowStart + 1 + Math.floor(x / perByte)] |=
        indices[y * width + x] << shift;
    }
  }

  return raw;
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(data.length + 12);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  view.setUint32(data.length + 8, crc32(out.subarray(4, data.length + 8)));
  return out;
}

let crcTable: Uint32Array | null = null;

function crc32(bytes: Uint8Array): number {
  if (!crcTable) {
    crcTable = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let value = i;
      for (let bit = 0; bit < 8; bit++) {
        value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
      }
      crcTable[i] = value >>> 0;
    }
  }

  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

type CompressionStreamConstructor = new (
  format: 'deflate'
) => TransformStream<Uint8Array, Uint8Array>;

/** Deflates into the zlib container PNG expects for its IDAT payload. */
async function deflate(bytes: Uint8Array): Promise<Uint8Array> {
  const CompressionStreamImpl = (
    globalThis as unknown as {
      CompressionStream?: CompressionStreamConstructor;
    }
  ).CompressionStream;

  if (!CompressionStreamImpl) {
    throw new Error('This browser cannot compress PNG data');
  }

  const { readable, writable } = new CompressionStreamImpl('deflate');
  const writer = writable.getWriter();
  // Not awaited: the writer only drains once we start reading below.
  const written = writer.write(bytes).then(() => writer.close());

  const reader = readable.getReader();
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  await written;

  return concat(chunks);
}

function concat(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((size, part) => size + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}
