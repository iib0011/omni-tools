export async function changeOpacity(
  file: File,
  opacity: number
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not supported'));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = opacity;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const newFile = new File([blob], file.name, { type: 'image/png' });
            resolve(newFile);
          } else {
            reject(new Error('Failed to generate image blob'));
          }
        }, 'image/png');
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = <string>event.target?.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
