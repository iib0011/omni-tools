import Color from 'color';
import InitialValuesType from './types';
import { heicTo, isHeic } from 'heic-to';
import JSZip from 'jszip';

const processImage = async (
  file: File,
  options: InitialValuesType
): Promise<File | undefined> => {
  const { backgroundColor, quality } = options;

  let processedFile = file;

  if (await isHeic(file)) {
    const convertedBlob = await heicTo({
      blob: file,
      type: 'image/jpeg'
    });

    processedFile = new File(
      [convertedBlob],
      file.name.replace(/\.[^/.]+$/, '') + '.jpg',
      { type: 'image/jpeg' }
    );
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx == null) return;

  const img = new Image();
  img.src = URL.createObjectURL(processedFile);

  try {
    await img.decode();

    canvas.width = img.width;
    canvas.height = img.height;

    let bgColor: [number, number, number];
    try {
      //@ts-ignore
      bgColor = Color(backgroundColor).rgb().array();
    } catch {
      bgColor = [255, 255, 255];
    }

    ctx.fillStyle = `rgb(${bgColor[0]}, ${bgColor[1]}, ${bgColor[2]})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const fileName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
            resolve(new File([blob], fileName, { type: 'image/jpeg' }));
          } else {
            resolve(undefined);
          }
        },
        'image/jpeg',
        quality / 100
      );
    });
  } catch (error) {
    console.error('Error processing image:', error);
  } finally {
    URL.revokeObjectURL(img.src);
  }
};

export const convertToJPG = async (
  files: File[],
  options: InitialValuesType
): Promise<{ results: File[]; zipFile: File | null } | null> => {
  try {
    const converted = await Promise.all(
      files.map(async (file) => {
        try {
          return (await processImage(file, options)) ?? null;
        } catch (error) {
          console.error(`Error converting ${file.name}:`, error);
          return null;
        }
      })
    );

    const results = converted.filter((f): f is File => f !== null);

    if (results.length === 0) return null;

    if (results.length === 1) return { results, zipFile: null };

    const zip = new JSZip();
    results.forEach((file) => zip.file(file.name, file));
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipFile = new File([zipBlob], 'converted-images.zip', {
      type: 'application/zip'
    });

    return { results, zipFile };
  } catch (error) {
    console.error('Error converting images:', error);
    return null;
  }
};
