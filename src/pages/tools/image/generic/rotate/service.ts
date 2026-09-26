import { InitialValuesType } from './type';
import { runFFmpegTask } from 'lib/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { getFileExtension } from '@utils/file';

export const processImage = async (
  file: File,
  options: InitialValuesType
): Promise<File | null> => {
  const { rotateAngle } = options;
  if (file.type === 'image/svg+xml') {
    try {
      // Read the SVG file
      const fileText = await file.text();
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(fileText, 'image/svg+xml');
      const svgElement = svgDoc.documentElement as unknown as SVGSVGElement;

      // Get current transform attribute or create new one
      let currentTransform = svgElement.getAttribute('transform') || '';

      const angle = parseInt(rotateAngle);

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
  return runFFmpegTask(async ({ ffmpeg, tempFile }) => {
    const extension = getFileExtension(file.name) ?? 'png';

    const inputName = tempFile(`.${extension}`);
    const outputName = tempFile('.png');

    await ffmpeg.writeFile(inputName, await fetchFile(file));

    const radians = `${Number(rotateAngle)}*PI/180`;

    await ffmpeg.exec([
      '-i',
      inputName,
      '-vf',
      `rotate=${radians}:ow=rotw(${radians}):oh=roth(${radians}):fillcolor=none`,
      outputName
    ]);

    const data = await ffmpeg.readFile(outputName);

    return new File(
      [new Uint8Array(data as Uint8Array)],
      `rotated_${file.name.replace(/\.[^/.]+$/, '.png')}`,
      {
        type: 'image/png'
      }
    );
  });
};
