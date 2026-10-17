import { fetchFile } from '@ffmpeg/util';
import { runFFmpegTask } from 'lib/ffmpeg';
import { InitialValuesType } from './types';
import { getFileExtension } from '@utils/file';

export const loopAudio = async (
  input: File,
  options: InitialValuesType
): Promise<File> => {
  return runFFmpegTask(async ({ ffmpeg, tempFile }) => {
    const extension = getFileExtension(input.name) || 'mp3';

    const inputFileName = tempFile(`.${extension}`);
    const outputFileName = tempFile(`.${extension}`);

    await ffmpeg.writeFile(inputFileName, await fetchFile(input));

    await ffmpeg.exec([
      '-stream_loop',
      String(options.loops - 1),
      '-i',
      inputFileName,
      '-c',
      'copy',
      outputFileName
    ]);

    const data = await ffmpeg.readFile(outputFileName);

    const blob = new Blob([new Uint8Array(data as Uint8Array)], {
      type: input.type
    });

    return new File([blob], `looped_${input.name}`, {
      type: input.type
    });
  });
};
