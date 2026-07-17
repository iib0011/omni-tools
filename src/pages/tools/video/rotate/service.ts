import { getFFmpeg, fetchFile } from '@lib/ffmpeg/ffmpegSingleton';

export async function rotateVideo(
  input: File,
  rotation: number
): Promise<File> {
  const ffmpeg = await getFFmpeg();

  const inputName = 'input.mp4';
  const outputName = 'output.mp4';
  await ffmpeg.writeFile(inputName, await fetchFile(input));

  const rotateMap: Record<number, string> = {
    90: 'transpose=1',
    180: 'transpose=2,transpose=2',
    270: 'transpose=2',
    0: ''
  };
  const rotateFilter = rotateMap[rotation];

  const args = ['-i', inputName];
  if (rotateFilter) {
    args.push('-vf', rotateFilter);
  }

  args.push('-c:v', 'libx264', '-preset', 'ultrafast', outputName);

  await ffmpeg.exec(args);

  const rotatedData = await ffmpeg.readFile(outputName);
  return new File(
    [new Blob([rotatedData as any], { type: 'video/mp4' })],
    `${input.name.replace(/\.[^/.]+$/, '')}_rotated.mp4`,
    { type: 'video/mp4' }
  );
}
