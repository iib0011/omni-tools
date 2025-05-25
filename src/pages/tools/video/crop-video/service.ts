import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { InitialValuesType } from './types';

const ffmpeg = new FFmpeg();

export async function getVideoDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: video.videoWidth,
        height: video.videoHeight
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video metadata'));
    };

    video.src = url;
  });
}

export async function cropVideo(
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
  const outputName = 'output.mp4';
  await ffmpeg.writeFile(inputName, await fetchFile(input));

  const args = [];

  if (options.width <= 0 || options.height <= 0) {
    throw new Error('Width and height must be positive');
  }

  args.push('-i', inputName);
  args.push(
    '-vf',
    `crop=${options.width}:${options.height}:${options.x}:${options.y}`
  );
  args.push('-c:v', 'libx264', '-preset', 'ultrafast', outputName);

  await ffmpeg.exec(args);

  const croppedData = await ffmpeg.readFile(outputName);
  return await new File(
    [new Blob([croppedData], { type: 'video/mp4' })],
    `${input.name.replace(/\.[^/.]+$/, '')}_cropped.mp4`,
    { type: 'video/mp4' }
  );
}
