import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { InitialValuesType } from './types';

const ffmpeg = new FFmpeg();

export async function convertToGif(
  input: File,
  options: InitialValuesType
): Promise<File> {
  if (!ffmpeg.loaded) {
    await ffmpeg.load({
      wasmURL:
        'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.9/dist/esm/ffmpeg-core.wasm'
    });
  }

  const inputName = 'input.mp4';
  const outputName = 'output.gif';

  await ffmpeg.writeFile(inputName, await fetchFile(input));

  const resolution = options.resolution === '720p' ? '1280x720' : '640x360';

  const args = [
    '-i',
    inputName,
    '-vf',
    `fps=${options.frameRate},scale=${resolution}:flags=lanczos`,
    outputName
  ];

  try {
    await ffmpeg.exec(args);
  } catch (error) {
    console.error('FFmpeg execution failed:', error);
    throw new Error('GIF conversion failed.');
  }

  const outputData = await ffmpeg.readFile(outputName);
  return new File(
    [new Blob([outputData], { type: 'image/gif' })],
    `${input.name.replace(/\.[^/.]+$/, '')}_converted.gif`,
    { type: 'image/gif' }
  );
}
