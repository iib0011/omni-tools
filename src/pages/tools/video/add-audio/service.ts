import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { AddAudioOptions } from './types';

const ffmpeg = new FFmpeg();

export async function addAudioToVideo(
  video: File,
  audio: File,
  options: AddAudioOptions
): Promise<File> {
  if (!ffmpeg.loaded) {
    await ffmpeg.load({
      wasmURL:
        'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.9/dist/esm/ffmpeg-core.wasm'
    });
  }

  const inputVideo = 'input.mp4';
  const inputAudio = 'input-audio.mp3';
  const outputName = 'output.mp4';

  await ffmpeg.writeFile(inputVideo, await fetchFile(video));
  await ffmpeg.writeFile(inputAudio, await fetchFile(audio));

  const volumeScale = (options.volume / 100).toFixed(2);
  let args: string[];

  if (options.mode === 'replace') {
    args = [
      '-i',
      inputVideo,
      '-i',
      inputAudio,
      '-c:v',
      'copy',
      '-filter_complex',
      `[1:a]volume=${volumeScale}[aout]`,
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
      '-i',
      inputVideo,
      '-i',
      inputAudio,
      '-c:v',
      'copy',
      '-filter_complex',
      `[1:a]volume=${volumeScale}[a1];[0:a][a1]amerge=inputs=2[aout]`,
      '-map',
      '0:v',
      '-map',
      '[aout]',
      '-ac',
      '2',
      '-shortest',
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
