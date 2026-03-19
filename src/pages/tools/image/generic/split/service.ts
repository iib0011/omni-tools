import { units } from './types';

export async function splitImage(
  initImg: HTMLImageElement,
  widthOfEachPart: number,
  heightOfEachPart: number
): Promise<File[]> {
  const { width, height } = initImg;
  const horParts = Math.ceil(width / widthOfEachPart);
  const verParts = Math.ceil(height / heightOfEachPart);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  const promises: Promise<File>[] = [];

  for (let y = 0; y < verParts; y++) {
    for (let x = 0; x < horParts; x++) {
      canvas.width = widthOfEachPart;
      canvas.height = heightOfEachPart;

      ctx.clearRect(0, 0, widthOfEachPart, heightOfEachPart);
      ctx.drawImage(
        initImg,
        x * widthOfEachPart,
        y * heightOfEachPart,
        widthOfEachPart,
        heightOfEachPart,
        0,
        0,
        widthOfEachPart,
        heightOfEachPart
      );

      const promise = canvasToFile(canvas, `part-${x}-${y}.png`);
      promises.push(promise);
    }
  }

  return Promise.all(promises);
}

export function loadImage(input: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(input);
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });
}

function canvasToFile(canvas: HTMLCanvasElement, name: string): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(new File([blob], name, { type: 'image/png' }));
      } else {
        reject(new Error('Failed to create blob'));
      }
    }, 'image/png');
  });
}

export function toPts(number: number, units: units): number {
  switch (units) {
    case 'pt':
      return number;
    case 'mm':
      return (number * 72) / 25.4;
    case 'in':
      return number * 72;
  }
}

export function fromPts(number: number, units: units): number {
  switch (units) {
    case 'pt':
      return number;
    case 'mm':
      return (number * 25.4) / 72;
    case 'in':
      return number / 72;
  }
}
