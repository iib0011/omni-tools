import { InitialValuesType } from './types';
import { getFFmpeg, fetchFile } from '@lib/ffmpeg/ffmpegSingleton';

export async function loopVideo(
  input: File,
  options: InitialValuesType
): Promise<File> {
  const ffmpeg = await getFFmpeg();

  const inputName = 'input.mp4';
  const outputName = 'output.mp4';
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
  return await new File(
    [new Blob([loopedData as any], { type: 'video/mp4' })],
    `${input.name.replace(/\.[^/.]+$/, '')}_looped.mp4`,
    { type: 'video/mp4' }
  );
}
