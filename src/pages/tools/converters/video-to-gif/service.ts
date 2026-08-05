import { runFFmpegTask } from 'lib/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { GIF_PRESETS, InitialValuesType } from './types';

export const videoToGif = async (
  input: File,
  options: InitialValuesType
): Promise<File> => {
  return runFFmpegTask(async ({ ffmpeg, tempFile }) => {
    const fileName = tempFile('.mp4');
    const outputName = tempFile('.gif');
    const paletteName = tempFile('.png');

    const { start, end, quality } = options;

    const { fps, scale } = GIF_PRESETS[quality];

    await ffmpeg.writeFile(fileName, await fetchFile(input));

    await ffmpeg.exec([
      '-i',
      fileName,
      '-ss',
      start.toString(),
      '-to',
      end.toString(),
      '-vf',
      `fps=${fps},scale=${scale},palettegen`,
      paletteName
    ]);

    await ffmpeg.exec([
      '-i',
      fileName,
      '-i',
      paletteName,
      '-ss',
      start.toString(),
      '-to',
      end.toString(),
      '-filter_complex',
      `fps=${fps},scale=${scale}[x];[x][1:v]paletteuse`,
      outputName
    ]);

    const data = await ffmpeg.readFile(outputName);

    const blob = new Blob([new Uint8Array(data as Uint8Array)], {
      type: 'image/gif'
    });
    return new File([blob], `${input.name.replace(/\.[^/.]+$/, '')}.gif`, {
      type: 'image/gif'
    });
  });
};
