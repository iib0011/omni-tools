import { runFFmpegTask } from 'lib/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { InitialValuesType } from './types';

export const changeGifSpeed = async (
  input: File,
  options: InitialValuesType
): Promise<File> => {
  return runFFmpegTask(async ({ ffmpeg, tempFile }) => {
    const inputName = tempFile('.gif');
    const outputName = tempFile('.gif');

    const { speed } = options;

    await ffmpeg.writeFile(inputName, await fetchFile(input));

    await ffmpeg.exec([
      '-i',
      inputName,
      '-filter_complex',
      `[0:v]setpts=${
        1 / speed
      }*PTS,split[a][b];[a]palettegen[p];[b][p]paletteuse`,
      '-f',
      'gif',
      outputName
    ]);

    const data = await ffmpeg.readFile(outputName);

    const blob = new Blob([new Uint8Array(data as Uint8Array)], {
      type: 'image/gif'
    });

    return new File([blob], input.name.replace('.gif', `-${speed}x.gif`), {
      type: 'image/gif'
    });
  });
};
