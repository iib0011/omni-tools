import { runFFmpegTask } from 'lib/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { RotationAngle, InitialValuesType } from './types';

const rotateMap: Record<RotationAngle, string> = {
  90: 'transpose=1',
  180: 'transpose=2,transpose=2',
  270: 'transpose=2'
};

export async function rotateVideo(
  input: File,
  options: InitialValuesType
): Promise<File> {
  return runFFmpegTask(async ({ ffmpeg, tempFile }) => {
    const inputName = tempFile('.mp4');
    const outputName = tempFile('.mp4');

    await ffmpeg.writeFile(inputName, await fetchFile(input));

    const { rotation } = options;

    const rotateFilter = rotateMap[rotation];

    const args = ['-i', inputName];
    if (rotateFilter) {
      args.push('-vf', rotateFilter);
    }

    args.push('-c:v', 'libx264', '-preset', 'ultrafast', outputName);

    await ffmpeg.exec(args);

    const rotatedData = await ffmpeg.readFile(outputName);

    const blob = new Blob([new Uint8Array(rotatedData as Uint8Array)], {
      type: 'video/mp4'
    });

    return new File(
      [blob],
      `${input.name.replace(/\.[^/.]+$/, '')}_rotated.mp4`,
      { type: 'video/mp4' }
    );
  });
}
