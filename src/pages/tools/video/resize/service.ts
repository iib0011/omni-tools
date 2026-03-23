import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();

export type VideoResolution = 426 | 640 | 854 | 1280 | 1920;

export interface ResizeVideoOptions {
  width: VideoResolution;
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

  const scaleFilter = `scale=${options.width}:-2`;

  const args = [
    '-i',
    inputName,
    '-vf',
    scaleFilter,
    '-c:v',
    'libx264',
    '-preset',
    'ultrafast',
    '-crf',
    '18',
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
    [new Blob([resizedData], { type: 'video/mp4' })],
    `${input.name.replace(/\.[^/.]+$/, '')}_resized_${options.width}p.mp4`,
    { type: 'video/mp4' }
  );
}
