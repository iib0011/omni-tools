import { InitialValuesType } from './type';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

export const processImage = async (
  file: File,
  options: InitialValuesType
): Promise<File | null> => {
  const { rotateAngle, rotateMethod } = options;
  if (file.type === 'image/svg+xml') {
    try {
      // Read the SVG file
      const fileText = await file.text();
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(fileText, 'image/svg+xml');
      const svgElement = svgDoc.documentElement as unknown as SVGSVGElement;

      // Get current transform attribute or create new one
      let currentTransform = svgElement.getAttribute('transform') || '';

      // Calculate rotation angle
      let angle = 0;
      if (rotateMethod === 'Preset') {
        if (rotateAngle === 'flip-x') {
          currentTransform += ' scale(-1,1)';
        } else if (rotateAngle === 'flip-y') {
          currentTransform += ' scale(1,-1)';
        } else {
          angle = parseInt(rotateAngle);
        }
      } else {
        angle = parseInt(rotateAngle);
      }

      // Add rotation if needed
      if (angle !== 0) {
        // Get SVG dimensions
        const bbox = svgElement.getBBox();
        const centerX = bbox.x + bbox.width / 2;
        const centerY = bbox.y + bbox.height / 2;

        currentTransform += ` rotate(${angle} ${centerX} ${centerY})`;
      }

      // Apply transform
      svgElement.setAttribute('transform', currentTransform.trim());

      // Convert back to file
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgDoc);
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      return new File([blob], file.name, { type: 'image/svg+xml' });
    } catch (error) {
      console.error('Error processing SVG:', error);
      return null;
    }
  }

  // For non-SVG images, use FFmpeg
  try {
    const ffmpeg = new FFmpeg();
    await ffmpeg.load();

    // Write input file
    await ffmpeg.writeFile('input', await fetchFile(file));

    // Determine rotation command
    let rotateCmd = '';
    if (rotateMethod === 'Preset') {
      if (rotateAngle === 'flip-x') {
        rotateCmd = 'hflip';
      } else if (rotateAngle === 'flip-y') {
        rotateCmd = 'vflip';
      } else {
        rotateCmd = `rotate=${rotateAngle}*PI/180`;
      }
    } else {
      rotateCmd = `rotate=${rotateAngle}*PI/180`;
    }

    // Execute FFmpeg command
    await ffmpeg.exec([
      '-i',
      'input',
      '-vf',
      rotateCmd,
      'output.' + file.name.split('.').pop()
    ]);

    // Read the output file
    const data = await ffmpeg.readFile('output.' + file.name.split('.').pop());
    return new File([data], file.name, { type: file.type });
  } catch (error) {
    console.error('Error processing image:', error);
    return null;
  }
};
