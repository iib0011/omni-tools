import { InitialValuesType } from './types';
import { runFFmpegTask } from 'lib/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { getFileExtension } from '@utils/file';

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
  input: File,
  options: InitialValuesType
): Promise<File> {
  return runFFmpegTask(async ({ ffmpeg, tempFile }) => {
    const { speed, outputFormat } = options;

    const fileName = tempFile(`.${getFileExtension(input.name)}`);
    const outputName = tempFile(`.${outputFormat}`);

    await ffmpeg.writeFile(fileName, await fetchFile(input));
    const audioFilter = computeAudioFilter(speed);
    const args = ['-i', fileName, '-filter:a', audioFilter];

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

    const blob = new Blob([new Uint8Array(data as Uint8Array)], {
      type: mimeType
    });

    return new File(
      [blob],
      fileName.replace(/\.[^/.]+$/, `-${speed}x.${outputFormat}`),
      { type: mimeType }
    );
  });
}
