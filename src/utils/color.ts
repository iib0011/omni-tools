export function areColorsSimilar(
  color1: [number, number, number, number?],
  color2: [number, number, number, number?],
  similarity: number
): boolean {
  const a1 = color1[3] ?? 255;
  const a2 = color2[3] ?? 255;

  const distance = Math.sqrt(
    Math.pow(color1[0] - color2[0], 2) +
      Math.pow(color1[1] - color2[1], 2) +
      Math.pow(color1[2] - color2[2], 2) +
      Math.pow(a1 - a2, 2)
  );

  const maxDistance = Math.sqrt(Math.pow(255, 2) * 4);

  return distance <= (similarity / 100) * maxDistance;
}

export function convertHexToRGBA(color: string): number {
  // Remove the leading '#' if present
  if (color.startsWith('#')) {
    color = color.slice(1);
  }

  // Convert the color to a number and add the alpha channel
  const colorValue = parseInt(color, 16);
  const alphaChannel = 0xff;
  return (colorValue << 8) | alphaChannel;
}

/**
 * Parses any valid CSS color string into its RGB components,
 * using the canvas's own color parser for correctness across
 * hex (#fff, #ffffff), rgb()/rgba(), hsl(), and named colors.
 */
export function parseColorToRgb(color: string): {
  r: number;
  g: number;
  b: number;
} {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context not supported');
  }

  ctx.fillStyle = color; // browser validates & normalizes the color here
  ctx.fillRect(0, 0, 1, 1);

  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return { r, g, b };
}
