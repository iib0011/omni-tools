import { runFFmpegTask } from 'lib/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { InitialValuesType } from './types';

export async function compressVideo(
  input: File,
  options: InitialValuesType
): Promise<File> {
  return runFFmpegTask(async ({ ffmpeg, tempFile }) => {
    const inputName = tempFile('.mp4');
    const outputName = tempFile('.mp4');

    await ffmpeg.writeFile(inputName, await fetchFile(input));

    // Calculate height as -1 to maintain aspect ratio
    const scaleFilter = `scale=${options.width}:-2`;

    const args = [
      '-i',
      inputName,
      '-vf',
      scaleFilter,
      '-c:v',
      'libx264',
      '-crf',
      options.crf.toString(),
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      outputName
    ];

    await ffmpeg.exec(args);

    const compressedData = await ffmpeg.readFile(outputName);

    const blob = new Blob([new Uint8Array(compressedData as Uint8Array)], {
      type: 'video/mp4'
    });

    return new File(
      [blob],
      `${input.name.replace(/\.[^/.]+$/, '')}_compressed_${options.width}p.mp4`,
      { type: 'video/mp4' }
    );
  });
}
