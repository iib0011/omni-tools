import { runFFmpegTask } from 'lib/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { FlipOrientation } from './types';

const flipMap: Record<FlipOrientation, string> = {
  horizontal: 'hflip',
  vertical: 'vflip'
};

export async function flipVideo(
  input: File,
  orientation: FlipOrientation
): Promise<File> {
  return runFFmpegTask(async ({ ffmpeg, tempFile }) => {
    const inputName = tempFile('.mp4');
    const outputName = tempFile('.mp4');
    await ffmpeg.writeFile(inputName, await fetchFile(input));

    const flipFilter = flipMap[orientation];

    const args = ['-i', inputName];
    if (flipFilter) {
      args.push('-vf', flipFilter);
    }

    args.push('-c:v', 'libx264', '-preset', 'ultrafast', outputName);

    await ffmpeg.exec(args);

    const flippedData = await ffmpeg.readFile(outputName);

    const blob = new Blob([new Uint8Array(flippedData as Uint8Array)], {
      type: 'video/mp4'
    });
    return new File(
      [blob],
      `${input.name.replace(/\.[^/.]+$/, '')}_flipped.mp4`,
      { type: 'video/mp4' }
    );
  });
}
