import { InitialValuesType } from './types';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

function computeAudioFilter(speed: number): string {
  if (speed <= 2 && speed >= 0.5) {
    return `atempo=${speed}`;
  }
  const filters: string[] = [];
  let remainingSpeed = speed;
  while (remainingSpeed > 2.0) {
    filters.push('atempo=2.0');
    remainingSpeed /= 2.0;
  }
  while (remainingSpeed < 0.5) {
    filters.push('atempo=0.5');
    remainingSpeed /= 0.5;
  }
  filters.push(`atempo=${remainingSpeed.toFixed(2)}`);
  return filters.join(',');
}

export async function changeAudioSpeed(
  input: File | null,
  options: InitialValuesType
): Promise<File | null> {
  if (!input) return null;
  const { newSpeed, outputFormat } = options;
  let ffmpeg: FFmpeg | null = null;
  let ffmpegLoaded = false;
  try {
    ffmpeg = new FFmpeg();
    if (!ffmpegLoaded) {
      await ffmpeg.load({
        wasmURL:
          'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.9/dist/esm/ffmpeg-core.wasm'
      });
      ffmpegLoaded = true;
    }
    const fileName = input.name;
    const outputName = `output.${outputFormat}`;
    await ffmpeg.writeFile(fileName, await fetchFile(input));
    const audioFilter = computeAudioFilter(newSpeed);
    let args = ['-i', fileName, '-filter:a', audioFilter];
    if (outputFormat === 'mp3') {
      args.push('-b:a', '192k', '-f', 'mp3', outputName);
    } else if (outputFormat === 'aac') {
      args.push('-c:a', 'aac', '-b:a', '192k', '-f', 'adts', outputName);
    } else if (outputFormat === 'wav') {
      args.push(
        '-acodec',
        'pcm_s16le',
        '-ar',
        '44100',
        '-ac',
        '2',
        '-f',
        'wav',
        outputName
      );
    }
    await ffmpeg.exec(args);
    const data = await ffmpeg.readFile(outputName);
    let mimeType = 'audio/mp3';
    if (outputFormat === 'aac') mimeType = 'audio/aac';
    if (outputFormat === 'wav') mimeType = 'audio/wav';
    const blob = new Blob([data], { type: mimeType });
    const newFile = new File(
      [blob],
      fileName.replace(/\.[^/.]+$/, `-${newSpeed}x.${outputFormat}`),
      { type: mimeType }
    );
    await ffmpeg.deleteFile(fileName);
    await ffmpeg.deleteFile(outputName);
    return newFile;
  } catch (err) {
    console.error(`Failed to process audio: ${err}`);
    return null;
  }
}
