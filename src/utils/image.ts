/**
 * Gets the dimensions of an image file.
 *
 * @param file - The image file to get the dimensions from.
 * @returns A promise resolving to the image width and height in pixels.
 */
export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Returns the maximum position for an area so it stays within the image bounds.
 *
 * @param imageSize - The image width or height.
 * @param areaSize - The width or height of the area.
 * @returns The maximum allowed position.
 */
export function getMaxAreaPosition(
  imageSize: number,
  areaSize: number
): number {
  return Math.max(0, imageSize - areaSize);
}
