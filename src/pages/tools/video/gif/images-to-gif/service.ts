import { runFFmpegTask } from 'lib/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { InitialValuesType } from './types';
import { getFileExtension } from '@utils/file';

export async function imagesToGif(
  input: File[],
  optionsValues: InitialValuesType
): Promise<File> {
  return runFFmpegTask(async ({ ffmpeg, tempFile }) => {
    const { frameDelay } = optionsValues;
    const fileNames: string[] = [];
    const listName = tempFile('.txt');
    const outputName = tempFile('.gif');

    const durationSeconds = frameDelay / 1000;

    for (let i = 0; i < input.length; i++) {
      const file = input[i];
      const ext = getFileExtension(file.name) ?? 'jpg';

      const inputName = tempFile(`.${ext}`);

      fileNames.push(inputName);

      await ffmpeg.writeFile(inputName, await fetchFile(file));
    }

    const listContent =
      fileNames
        .map((name) => `file '${name}'\nduration ${durationSeconds}`)
        .join('\n') + `\nfile '${fileNames[fileNames.length - 1]}'`;

    await ffmpeg.writeFile(listName, listContent);

    await ffmpeg.exec([
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      listName,
      '-vf',
      'scale=480:-2:flags=lanczos',
      '-loop',
      '0',
      outputName
    ]);

    const data = await ffmpeg.readFile(outputName);

    return new File([new Uint8Array(data as Uint8Array)], 'animated.gif', {
      type: 'image/gif'
    });
  });
}
