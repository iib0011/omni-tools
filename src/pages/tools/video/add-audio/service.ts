import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { AddAudioOptions } from './types';

const ffmpeg = new FFmpeg();

async function ensureLoaded() {
  if (!ffmpeg.loaded) {
    await ffmpeg.load({
      wasmURL:
        'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.9/dist/esm/ffmpeg-core.wasm'
    });
  }
}

export function timeToSeconds(time: string): number {
  const parts = time.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

function hasDurationConstraint(options: AddAudioOptions): boolean {
  const start = timeToSeconds(options.startTime);
  const end = timeToSeconds(options.endTime);
  return start > 0 || end > 0;
}

function buildAudioFilterChain(options: AddAudioOptions): string {
  const volumeScale = (options.volume / 100).toFixed(2);
  const start = timeToSeconds(options.startTime);
  const end = timeToSeconds(options.endTime);
  const hasConstraint = start > 0 || end > 0;

  const filters: string[] = [];
  filters.push(`volume=${volumeScale}`);

  if (hasConstraint) {
    if (start > 0 && end > 0) {
      filters.push(`atrim=start=0:end=${end - start}`);
      filters.push(`adelay=${start * 1000}|${start * 1000}`);
    } else if (start > 0) {
      filters.push(`adelay=${start * 1000}|${start * 1000}`);
    } else if (end > 0) {
      filters.push(`atrim=start=0:end=${end}`);
    }
    filters.push('apad');
  }

  return filters.join(',');
}

function buildReplaceFilter(options: AddAudioOptions): string {
  const chain = buildAudioFilterChain(options);
  return `[1:a]${chain}[aout]`;
}

function buildMixFilter(options: AddAudioOptions): string {
  const chain = buildAudioFilterChain(options);
  return `[1:a]${chain}[a1];[0:a][a1]amerge=inputs=2[aout]`;
}

export async function addAudioToVideo(
  video: File,
  audio: File,
  options: AddAudioOptions
): Promise<File> {
  await ensureLoaded();

  const inputVideo = 'input.mp4';
  const inputAudio = 'input-audio.mp3';
  const outputName = 'output.mp4';

  await ffmpeg.writeFile(inputVideo, await fetchFile(video));
  await ffmpeg.writeFile(inputAudio, await fetchFile(audio));

  const inputArgs: string[] = [];
  inputArgs.push('-i', inputVideo);
  if (options.loop) {
    inputArgs.push('-stream_loop', '-1');
  }
  inputArgs.push('-i', inputAudio);

  const hasConstraint = hasDurationConstraint(options);

  let args: string[];

  if (options.mode === 'replace') {
    args = [
      ...inputArgs,
      '-c:v',
      'copy',
      '-filter_complex',
      buildReplaceFilter(options),
      '-map',
      '0:v:0',
      '-map',
      '[aout]',
      '-shortest',
      '-y',
      outputName
    ];
  } else {
    args = [
      ...inputArgs,
      '-c:v',
      'copy',
      '-filter_complex',
      buildMixFilter(options),
      '-map',
      '0:v',
      '-map',
      '[aout]',
      '-ac',
      '2',
      ...(hasConstraint ? [] : ['-shortest']),
      '-y',
      outputName
    ];
  }

  try {
    await ffmpeg.exec(args);
  } catch (error) {
    console.error('FFmpeg execution failed:', error);
  }

  const data = await ffmpeg.readFile(outputName);
  return new File(
    [new Blob([data as any], { type: 'video/mp4' })],
    `${video.name.replace(/\.[^/.]+$/, '')}_with_audio.mp4`,
    { type: 'video/mp4' }
  );
}
