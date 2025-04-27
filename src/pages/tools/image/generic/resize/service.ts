import { InitialValuesType } from './types';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export const processImage = async (
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
      // Read the SVG file
      const fileText = await file.text();
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(fileText, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;

      // Get original dimensions
      const viewBox = svgElement.getAttribute('viewBox');
      let originalWidth: string | number | null =
        svgElement.getAttribute('width');
      let originalHeight: string | number | null =
        svgElement.getAttribute('height');

      // Parse viewBox if available and width/height are not explicitly set
      let viewBoxValues = null;
      if (viewBox) {
        viewBoxValues = viewBox.split(' ').map(Number);
      }

      // Determine original dimensions from viewBox if not explicitly set
      if (!originalWidth && viewBoxValues && viewBoxValues.length === 4) {
        originalWidth = String(viewBoxValues[2]);
      }
      if (!originalHeight && viewBoxValues && viewBoxValues.length === 4) {
        originalHeight = String(viewBoxValues[3]);
      }

      // Default dimensions if still not available
      originalWidth = originalWidth ? parseFloat(originalWidth) : 300;
      originalHeight = originalHeight ? parseFloat(originalHeight) : 150;

      // Calculate new dimensions
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
          // height
          newHeight = parseInt(height);
          if (maintainAspectRatio) {
            newWidth = Math.round((newHeight / originalHeight) * originalWidth);
          } else {
            newWidth = parseInt(width);
          }
        }
      } else {
        // percentage
        const scale = parseInt(percentage) / 100;
        newWidth = Math.round(originalWidth * scale);
        newHeight = Math.round(originalHeight * scale);
      }

      // Update SVG attributes
      svgElement.setAttribute('width', String(newWidth));
      svgElement.setAttribute('height', String(newHeight));

      // If viewBox isn't already set, add it to preserve scaling
      if (!viewBox) {
        svgElement.setAttribute(
          'viewBox',
          `0 0 ${originalWidth} ${originalHeight}`
        );
      }

      // Serialize the modified SVG document
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgDoc);

      // Create a new file
      return new File([svgString], file.name, {
        type: 'image/svg+xml'
      });
    } catch (error) {
      console.error('Error processing SVG:', error);
      // Fall back to canvas method if SVG processing fails
    }
  } else if (file.type === 'image/gif') {
    try {
      const ffmpeg = new FFmpeg();

      await ffmpeg.load({
        wasmURL:
          'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.9/dist/esm/ffmpeg-core.wasm'
      });

      // Write the input file to memory
      await ffmpeg.writeFile('input.gif', await fetchFile(file));

      // Calculate new dimensions
      let newWidth = 0;
      let newHeight = 0;
      let scaleFilter = '';

      if (resizeMethod === 'pixels') {
        if (dimensionType === 'width') {
          newWidth = parseInt(width);
          if (maintainAspectRatio) {
            scaleFilter = `scale=${newWidth}:-1`;
          } else {
            newHeight = parseInt(height);
            scaleFilter = `scale=${newWidth}:${newHeight}`;
          }
        } else {
          // height
          newHeight = parseInt(height);
          if (maintainAspectRatio) {
            scaleFilter = `scale=-1:${newHeight}`;
          } else {
            newWidth = parseInt(width);
            scaleFilter = `scale=${newWidth}:${newHeight}`;
          }
        }
      } else {
        // percentage
        const scale = parseInt(percentage) / 100;
        scaleFilter = `scale=iw*${scale}:ih*${scale}`;
      }

      // Run FFmpeg command
      await ffmpeg.exec(['-i', 'input.gif', '-vf', scaleFilter, 'output.gif']);

      // Read the output file
      const data = await ffmpeg.readFile('output.gif');

      // Create a new File object
      return new File([data], file.name, { type: 'image/gif' });
    } catch (error) {
      console.error('Error processing GIF with FFmpeg:', error);
      // Fall back to canvas method if FFmpeg processing fails
    }
  }
  // Create canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx == null) return null;

  // Load image
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode();

  // Calculate new dimensions
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
      // height
      newHeight = parseInt(height);
      if (maintainAspectRatio) {
        newWidth = Math.round((newHeight / img.height) * img.width);
      } else {
        newWidth = parseInt(width);
      }
    }
  } else {
    // percentage
    const scale = parseInt(percentage) / 100;
    newWidth = Math.round(img.width * scale);
    newHeight = Math.round(img.height * scale);
  }

  // Set canvas dimensions
  canvas.width = newWidth;
  canvas.height = newHeight;

  // Draw resized image
  ctx.drawImage(img, 0, 0, newWidth, newHeight);

  // Determine output type based on input file
  let outputType = 'image/png';
  if (file.type) {
    outputType = file.type;
  }

  // Convert canvas to blob and create file
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(new File([blob], file.name, { type: outputType }));
      } else {
        resolve(null);
      }
    }, outputType);
  });
};
