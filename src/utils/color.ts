export function areColorsSimilar(
  color1: [number, number, number],
  color2: [number, number, number],
  similarity: number
): boolean {
  const colorDistance = (
    c1: [number, number, number],
    c2: [number, number, number]
  ) => {
    return Math.sqrt(
      Math.pow(c1[0] - c2[0], 2) +
        Math.pow(c1[1] - c2[1], 2) +
        Math.pow(c1[2] - c2[2], 2)
    );
  };
  const maxColorDistance = Math.sqrt(
    Math.pow(255, 2) + Math.pow(255, 2) + Math.pow(255, 2)
  );
  const similarityThreshold = (similarity / 100) * maxColorDistance;

  return colorDistance(color1, color2) <= similarityThreshold;
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
