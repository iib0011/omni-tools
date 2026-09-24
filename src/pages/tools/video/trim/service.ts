import { InitialValuesType } from './types';
import { fetchFile } from '@ffmpeg/util';
import { runFFmpegTask } from 'lib/ffmpeg';

export async function trimVideo(
  input: File,
  options: InitialValuesType
): Promise<File> {
  return runFFmpegTask(async ({ ffmpeg, tempFile }) => {
    const { start, end } = options;

    const inputName = tempFile('.mp4');
    const outputName = tempFile('.mp4');

    await ffmpeg.writeFile(inputName, await fetchFile(input));

    await ffmpeg.exec([
      '-i',
      inputName,
      '-ss',
      start.toString(),
      '-to',
      end.toString(),
      '-c',
      'copy',
      outputName
    ]);

    const trimmedData = await ffmpeg.readFile(outputName);

    const blob = new Blob([new Uint8Array(trimmedData as Uint8Array)], {
      type: 'video/mp4'
    });
    return new File(
      [blob],
      `${input.name.replace(/\.[^/.]+$/, '')}_trimmed.mp4`,
      {
        type: 'video/mp4'
      }
    );
  });
}
