import { InitialValuesType } from './types';

export const generateMeme = async (
  imageFile: File,
  options: InitialValuesType
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Configure text style
      const fontSize = (options.fontSize / 100) * img.height; // Scale font size relative to image height
      ctx.font = `bold ${fontSize}px Impact, sans-serif`;
      ctx.fillStyle = options.textColor;
      ctx.strokeStyle = options.strokeColor;
      ctx.lineWidth = fontSize / 15;
      ctx.textAlign = 'center';

      // Draw Top Text
      if (options.topText) {
        ctx.textBaseline = 'top';
        ctx.strokeText(
          options.topText.toUpperCase(),
          canvas.width / 2,
          fontSize * 0.2
        );
        ctx.fillText(
          options.topText.toUpperCase(),
          canvas.width / 2,
          fontSize * 0.2
        );
      }

      // Draw Bottom Text
      if (options.bottomText) {
        ctx.textBaseline = 'bottom';
        ctx.strokeText(
          options.bottomText.toUpperCase(),
          canvas.width / 2,
          canvas.height - fontSize * 0.2
        );
        ctx.fillText(
          options.bottomText.toUpperCase(),
          canvas.width / 2,
          canvas.height - fontSize * 0.2
        );
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const newFile = new File([blob], `meme-${imageFile.name}`, {
            type: imageFile.type
          });
          resolve(newFile);
        } else {
          reject(new Error('Canvas to Blob failed'));
        }
      }, imageFile.type);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(imageFile);
  });
};
