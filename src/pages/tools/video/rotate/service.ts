import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();

export async function rotateVideo(
  input: File,
  rotation: number
): Promise<File> {
  if (!ffmpeg.loaded) {
    await ffmpeg.load({
      wasmURL:
        'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.9/dist/esm/ffmpeg-core.wasm'
    });
  }

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
    [new Blob([rotatedData], { type: 'video/mp4' })],
    `${input.name.replace(/\.[^/.]+$/, '')}_rotated.mp4`,
    { type: 'video/mp4' }
  );
}
