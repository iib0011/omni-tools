import { InitialValuesType } from './types';
import { runFFmpegTask } from 'lib/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

export async function loopVideo(
  input: File,
  options: InitialValuesType
): Promise<File> {
  return runFFmpegTask(async ({ ffmpeg, tempFile }) => {
    const inputName = tempFile('.mp4');
    const outputName = tempFile('.mp4');
    await ffmpeg.writeFile(inputName, await fetchFile(input));

    const args = [];
    const loopCount = options.loops - 1;

    if (loopCount <= 0) {
      return input;
    }

    args.push('-stream_loop', loopCount.toString());
    args.push('-i', inputName);
    args.push('-c:v', 'libx264', '-preset', 'ultrafast', outputName);

    await ffmpeg.exec(args);

    const loopedData = await ffmpeg.readFile(outputName);

    const blob = new Blob([new Uint8Array(loopedData as Uint8Array)], {
      type: 'video/mp4'
    });
    return await new File(
      [blob],
      `${input.name.replace(/\.[^/.]+$/, '')}_looped.mp4`,
      { type: 'video/mp4' }
    );
  });
}
