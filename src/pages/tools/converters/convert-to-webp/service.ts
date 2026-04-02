import JSZip from 'jszip';

export const convertToWebp = async (
  files: File[],
  quality: number,
  backgroundColor: string
): Promise<{ convertedFiles: File[]; zipFile: File | null } | null> => {
  try {
    // Map Out the files
    const output = await Promise.all(
      files.map(async (file) => {
        try {
          // Process Images One by One
          const processedImage = await processImage(
            file,
            quality,
            backgroundColor
          );

          return processedImage;
        } catch (error) {
          console.error(`Error converting ${file.name} to WEBP:`, error);
          return null;
        }
      })
    );

    // Filter Out The Valid Files
    const convertedFiles = output.filter((f): f is File => f !== null);

    // Checking the Need to Convert
    if (convertedFiles.length === 0) return null;

    if (convertedFiles.length === 1) return { convertedFiles, zipFile: null };

    // Converting Into Zip File
    const zip = new JSZip();
    convertedFiles.forEach((file) => zip.file(file.name, file));
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipFile = new File([zipBlob], 'compressed-images.zip', {
      type: 'application/zip'
    });

    if (convertedFiles) {
      return { convertedFiles, zipFile };
    } else {
      return null;
    }
  } catch (error) {
    throw new Error(error as string);
  }
};

// Process and Return An Image
async function processImage(
  file: File,
  quality: number,
  backgroundColor: string
): Promise<File | null> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx == null) return null;

  const img = new Image();
  img.src = URL.createObjectURL(file);

  try {
    await img.decode();

    canvas.width = img.width;
    canvas.height = img.height;

    // Fill background with selected color (important for transparency)
    let bgColor: [number, number, number];
    try {
      //@ts-ignore
      bgColor = Color(backgroundColor).rgb().array();
    } catch (err) {
      bgColor = [255, 255, 255]; // Default to white
    }

    ctx.fillStyle = `rgb(${bgColor[0]}, ${bgColor[1]}, ${bgColor[2]})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the image on top
    ctx.drawImage(img, 0, 0);

    const fileName = file.name.replace(/\.[^/.]+$/, '') + '.webp';

    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject('Canvas toBlob returned null')),
        'image/webp',
        quality / 100
      );
    });

    return new File([blob], fileName, { type: 'image/webp' });
  } catch (error) {
    console.error(`Error converting ${file.name} to WEBP:`, error);
    return null;
  } finally {
    URL.revokeObjectURL(img.src);
  }
}
