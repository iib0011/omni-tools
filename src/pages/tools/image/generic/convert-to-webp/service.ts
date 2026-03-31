import { MultiImageInput } from '@components/input/ToolMultipleImageInput';
import JSZip from 'jszip';

// Take In Multiple Images, Then Convert All into WebP
export default async function processImages(
  files: MultiImageInput[],
  maxFileSizeInMb: number,
  backgroundColor: string
): Promise<{ convertedFiles: File[]; zipFile: File | null } | null> {
  try {
    // Map Out the files
    const output = await Promise.all(
      files.map(async (file) => {
        try {
          // Process Images One by One
          const processedImage = await processSingleImage(
            file.file,
            maxFileSizeInMb,
            backgroundColor
          );

          return processedImage;
        } catch (error) {
          throw new Error(error as string);
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
}

// Process and Return An Image
async function processSingleImage(
  currentFile: File,
  maxFileSizeInMb: number,
  backgroundColor: string
): Promise<File | null> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx == null) return null;

  const img = new Image();
  img.src = URL.createObjectURL(currentFile);

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

    // Check If Size is Within Constraint
    const quality = 100;
    const maxByteCount = maxFileSizeInMb * 1024 * 1024;
    const fileName = currentFile.name.replace(/\.[^/.]+$/, '') + '.webp';

    const convertWithSize = (quality: number): Promise<File | null> => {
      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFile = new File([blob], fileName, {
                type: 'image/webp'
              });

              // Step Down by 10% Quality Every Time
              if (newFile.size > maxByteCount) {
                if (quality > 10) {
                  convertWithSize(quality - 10)
                    .then(resolve)
                    .catch(reject);
                } else {
                  reject(
                    new Error('Image cannot be converted within given size!')
                  );
                }
              } else {
                resolve(newFile);
              }
            } else {
              reject(new Error('Canvas toBlob returned as null'));
            }
          },
          'image/webp',
          quality / 100
        );
      });
    };

    const result = await convertWithSize(quality);

    // Return the Final Result Upon Recursion End
    return result;
  } catch (error) {
    throw new Error(error as string);
  } finally {
    URL.revokeObjectURL(img.src);
  }
}
