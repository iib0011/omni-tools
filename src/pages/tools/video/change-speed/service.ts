import { InitialValuesType } from './types';
import { fetchFile } from '@ffmpeg/util';
import { runFFmpegTask } from 'lib/ffmpeg';
import { getFileExtension } from '@utils/file';

const computeAudioFilter = (speed: number): string => {
  if (speed >= 0.5 && speed <= 2) {
    return `atempo=${speed}`;
  }

  const filters: string[] = [];
  let remainingSpeed = speed;

  while (remainingSpeed > 2) {
    filters.push('atempo=2.0');
    remainingSpeed /= 2;
  }

  while (remainingSpeed < 0.5) {
    filters.push('atempo=0.5');
    remainingSpeed /= 0.5;
  }

  filters.push(`atempo=${remainingSpeed.toFixed(2)}`);

  return filters.join(',');
};

export const ChangeVideoSpeed = async (
  file: File,
  options: InitialValuesType
): Promise<File> => {
  const { speed } = options;

  return runFFmpegTask(async ({ ffmpeg, tempFile }) => {
    const extension = getFileExtension(file.name);

    const fileName = tempFile(extension ? `.${extension}` : '');

    const outputName = tempFile('.mp4');

    await ffmpeg.writeFile(fileName, await fetchFile(file));

    const videoFilter = `setpts=${1 / speed}*PTS`;
    const audioFilter = computeAudioFilter(speed);

    await ffmpeg.exec([
      '-i',
      fileName,
      '-vf',
      videoFilter,
      '-filter:a',
      audioFilter,
      '-c:v',
      'libx264',
      '-preset',
      'ultrafast',
      '-c:a',
      'aac',
      outputName
    ]);

    const data = await ffmpeg.readFile(outputName);

    const blob = new Blob([new Uint8Array(data as Uint8Array)], {
      type: 'video/mp4'
    });

    const baseName = file.name.replace(/\.[^/.]+$/, '');

    return new File([blob], `${baseName}-${speed}x.mp4`, {
      type: 'video/mp4'
    });
  });
};
