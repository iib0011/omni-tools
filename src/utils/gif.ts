import { GifBinary } from 'omggif';

export function gifBinaryToFile(
  gifBinary: GifBinary,
  fileName: string,
  mimeType: string = 'image/gif'
): File {
  // Convert GifBinary to Uint8Array
  const uint8Array = new Uint8Array(gifBinary.length);
  for (let i = 0; i < gifBinary.length; i++) {
    uint8Array[i] = gifBinary[i];
  }

  const blob = new Blob([uint8Array], { type: mimeType });

  // Create File from Blob
  return new File([blob], fileName, { type: mimeType });
}
