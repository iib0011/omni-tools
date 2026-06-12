import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();

export type VideoResolution = 240 | 360 | 480 | 720 | 1080;

export interface ResizeVideoOptions {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
}

export async function resizeVideo(
  input: File,
  options: ResizeVideoOptions
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

  const scaleFilter = options.maintainAspectRatio
    ? `scale=${options.width}:-2`
    : `scale=${options.width}:${options.height}`;

  const args = [
    '-i',
    inputName,
    '-vf',
    scaleFilter,
    '-c:v',
    'libx264',
    '-preset',
    'medium',
    '-c:a',
    'copy',
    outputName
  ];

  try {
    await ffmpeg.exec(args);
  } catch (error) {
    console.error('FFmpeg execution failed:', error);
  }

  const resizedData = await ffmpeg.readFile(outputName);
  return new File(
    [new Blob([resizedData as any], { type: 'video/mp4' })],
    `${input.name.replace(/\.[^/.]+$/, '')}_${options.width}x${
      options.maintainAspectRatio ? 'auto' : options.height
    }.mp4`,
    { type: 'video/mp4' }
  );
}
