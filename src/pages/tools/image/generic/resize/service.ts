import { InitialValuesType } from './types';
import { runFFmpegTask } from 'lib/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import JSZip from 'jszip';

const processImage = async (
  file: File,
  options: InitialValuesType
): Promise<File | null> => {
  const {
    width,
    height,
    resizeMethod,
    percentage,
    dimensionType,
    maintainAspectRatio
  } = options;

  if (file.type === 'image/svg+xml') {
    try {
      const fileText = await file.text();
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(fileText, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;

      const viewBox = svgElement.getAttribute('viewBox');

      let originalWidth: string | number | null =
        svgElement.getAttribute('width');

      let originalHeight: string | number | null =
        svgElement.getAttribute('height');

      let viewBoxValues = null;

      if (viewBox) {
        viewBoxValues = viewBox.split(' ').map(Number);
      }

      if (!originalWidth && viewBoxValues?.length === 4) {
        originalWidth = String(viewBoxValues[2]);
      }

      if (!originalHeight && viewBoxValues?.length === 4) {
        originalHeight = String(viewBoxValues[3]);
      }

      originalWidth = originalWidth ? parseFloat(originalWidth) : 300;
      originalHeight = originalHeight ? parseFloat(originalHeight) : 150;

      let newWidth = originalWidth;
      let newHeight = originalHeight;

      if (resizeMethod === 'pixels') {
        if (dimensionType === 'width') {
          newWidth = parseInt(width);

          if (maintainAspectRatio) {
            newHeight = Math.round((newWidth / originalWidth) * originalHeight);
          } else {
            newHeight = parseInt(height);
          }
        } else {
          newHeight = parseInt(height);

          if (maintainAspectRatio) {
            newWidth = Math.round((newHeight / originalHeight) * originalWidth);
          } else {
            newWidth = parseInt(width);
          }
        }
      } else {
        const scale = parseInt(percentage) / 100;

        newWidth = Math.round(originalWidth * scale);
        newHeight = Math.round(originalHeight * scale);
      }

      svgElement.setAttribute('width', String(newWidth));
      svgElement.setAttribute('height', String(newHeight));

      if (!viewBox) {
        svgElement.setAttribute(
          'viewBox',
          `0 0 ${originalWidth} ${originalHeight}`
        );
      }

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgDoc);

      return new File([svgString], file.name, {
        type: 'image/svg+xml'
      });
    } catch (error) {
      console.error('Error processing SVG:', error);
    }
  }

  if (file.type === 'image/gif') {
    try {
      return await runFFmpegTask(async ({ ffmpeg, tempFile }) => {
        const inputName = tempFile('.gif');
        const outputName = tempFile('.gif');

        await ffmpeg.writeFile(inputName, await fetchFile(file));

        let scaleFilter = '';

        if (resizeMethod === 'pixels') {
          if (dimensionType === 'width') {
            const newWidth = parseInt(width);

            scaleFilter = maintainAspectRatio
              ? `scale=${newWidth}:-1`
              : `scale=${newWidth}:${parseInt(height)}`;
          } else {
            const newHeight = parseInt(height);

            scaleFilter = maintainAspectRatio
              ? `scale=-1:${newHeight}`
              : `scale=${parseInt(width)}:${newHeight}`;
          }
        } else {
          const scale = parseInt(percentage) / 100;
          scaleFilter = `scale=iw*${scale}:ih*${scale}`;
        }

        await ffmpeg.exec([
          '-i',
          inputName,
          '-vf',
          `${scaleFilter},split[a][b];[a]palettegen[p];[b][p]paletteuse`,
          outputName
        ]);

        const data = await ffmpeg.readFile(outputName);

        return new File([new Uint8Array(data as Uint8Array)], file.name, {
          type: 'image/gif'
        });
      });
    } catch (error) {
      console.error('Error processing GIF with FFmpeg:', error);
    }
  }

  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    const img = new Image();
    img.src = URL.createObjectURL(file);

    await img.decode();

    let newWidth = img.width;
    let newHeight = img.height;

    if (resizeMethod === 'pixels') {
      if (dimensionType === 'width') {
        newWidth = parseInt(width);

        if (maintainAspectRatio) {
          newHeight = Math.round((newWidth / img.width) * img.height);
        } else {
          newHeight = parseInt(height);
        }
      } else {
        newHeight = parseInt(height);

        if (maintainAspectRatio) {
          newWidth = Math.round((newHeight / img.height) * img.width);
        } else {
          newWidth = parseInt(width);
        }
      }
    } else {
      const scale = parseInt(percentage) / 100;

      newWidth = Math.round(img.width * scale);
      newHeight = Math.round(img.height * scale);
    }

    canvas.width = newWidth;
    canvas.height = newHeight;

    ctx.drawImage(img, 0, 0, newWidth, newHeight);

    const outputType = file.type || 'image/png';

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(null);
          return;
        }

        resolve(
          new File([blob], file.name, {
            type: outputType
          })
        );
      }, outputType);
    });
  } catch (error) {
    console.error('Error processing image:', error);
    return null;
  }
};

export const resizeImages = async (
  files: File[],
  options: InitialValuesType
): Promise<{ results: File[]; zipFile: File | null } | null> => {
  try {
    const processed = await Promise.all(
      files.map(async (file) => {
        try {
          return await processImage(file, options);
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
          return null;
        }
      })
    );

    const results = processed.filter((file): file is File => file !== null);

    if (results.length === 0) {
      return null;
    }

    if (results.length === 1) {
      return {
        results,
        zipFile: null
      };
    }

    const zip = new JSZip();

    results.forEach((file) => {
      zip.file(file.name, file);
    });

    const zipBlob = await zip.generateAsync({
      type: 'blob'
    });

    return {
      results,
      zipFile: new File([zipBlob], 'resized-images.zip', {
        type: 'application/zip'
      })
    };
  } catch (error) {
    console.error('Error processing images:', error);
    return null;
  }
};
