import { runFFmpegTask } from 'lib/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { InitialValuesType } from './types';

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
  return runFFmpegTask(async ({ ffmpeg, tempFile }) => {
    const inputName = tempFile('.mp4');
    const outputName = tempFile('.mp4');

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

    const blob = new Blob([new Uint8Array(croppedData as Uint8Array)], {
      type: 'video/mp4'
    });

    return await new File(
      [blob],
      `${input.name.replace(/\.[^/.]+$/, '')}_cropped.mp4`,
      { type: 'video/mp4' }
    );
  });
}
