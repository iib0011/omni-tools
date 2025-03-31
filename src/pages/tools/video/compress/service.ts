import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();

export type VideoResolution = 240 | 360 | 480 | 720 | 1080;

export interface CompressVideoOptions {
  width: VideoResolution;
  crf: number; // Constant Rate Factor (quality): lower = better quality, higher = smaller file
  preset: string; // Encoding speed preset
}

export async function compressVideo(
  input: File,
  options: CompressVideoOptions
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

  // Calculate height as -1 to maintain aspect ratio
  const scaleFilter = `scale=${options.width}:-2`;

  const args = [
    '-i',
    inputName,
    '-vf',
    scaleFilter,
    '-c:v',
    'libx264',
    '-crf',
    options.crf.toString(),
    '-preset',
    options.preset,
    '-c:a',
    'aac', // Copy audio stream
    outputName
  ];

  try {
    await ffmpeg.exec(args);
  } catch (error) {
    console.error('FFmpeg execution failed:', error);
  }
  const compressedData = await ffmpeg.readFile(outputName);
  return new File(
    [new Blob([compressedData], { type: 'video/mp4' })],
    `${input.name.replace(/\.[^/.]+$/, '')}_compressed_${options.width}p.mp4`,
    { type: 'video/mp4' }
  );
}
