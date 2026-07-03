import { getFFmpeg, fetchFile } from '@lib/ffmpeg/ffmpegSingleton';

export async function flipVideo(
  input: File,
  flipDirection: 'horizontal' | 'vertical'
): Promise<File> {
  const ffmpeg = await getFFmpeg();

  const inputName = 'input.mp4';
  const outputName = 'output.mp4';
  await ffmpeg.writeFile(inputName, await fetchFile(input));

  const flipMap: Record<string, string> = {
    horizontal: 'hflip',
    vertical: 'vflip'
  };
  const flipFilter = flipMap[flipDirection];

  const args = ['-i', inputName];
  if (flipFilter) {
    args.push('-vf', flipFilter);
  }

  args.push('-c:v', 'libx264', '-preset', 'ultrafast', outputName);

  await ffmpeg.exec(args);

  const flippedData = await ffmpeg.readFile(outputName);
  return new File(
    [new Blob([flippedData as any], { type: 'video/mp4' })],
    `${input.name.replace(/\.[^/.]+$/, '')}_flipped.mp4`,
    { type: 'video/mp4' }
  );
}
