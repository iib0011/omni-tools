import { runFFmpegTask } from 'lib/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { InitialValuesType } from './types';

export async function resizeVideo(
  input: File,
  options: InitialValuesType
): Promise<File> {
  return runFFmpegTask(async ({ ffmpeg, tempFile }) => {
    const inputName = tempFile('.mp4');
    const outputName = tempFile('.mp4');

    await ffmpeg.writeFile(inputName, await fetchFile(input));

    const maintainAspectRatio =
      options.mode === 'preset' || options.maintainAspectRatio;

    // -2 keeps the aspect ratio while staying divisible by 2 for libx264
    const scaleFilter = maintainAspectRatio
      ? `scale=${options.width}:-2`
      : `scale=${options.width}:${options.height}`;

    const args = [
      '-i',
      inputName,
      '-vf',
      scaleFilter,
      '-c:v',
      'libx264',
      '-preset',
      'medium',
      '-c:a',
      'copy',
      outputName
    ];

    await ffmpeg.exec(args);

    const resizedData = await ffmpeg.readFile(outputName);

    const blob = new Blob([new Uint8Array(resizedData as Uint8Array)], {
      type: 'video/mp4'
    });

    return new File(
      [blob],
      `${input.name.replace(/\.[^/.]+$/, '')}_${options.width}x${
        maintainAspectRatio ? 'auto' : options.height
      }.mp4`,
      { type: 'video/mp4' }
    );
  });
}
