import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { InitialValuesType } from './types';

const ffmpeg = new FFmpeg();

export async function extractAudioFromVideo(
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
  await ffmpeg.writeFile(inputName, await fetchFile(input));

  const configuredOutputAudioFormat = options.outputFormat;
  const outputName = `output.${configuredOutputAudioFormat}`;
  const args: string[] = ['-i', inputName, '-vn'];

  if (configuredOutputAudioFormat === 'mp3') {
    args.push(
      '-ar',
      '44100',
      '-ac',
      '2',
      '-b:a',
      '192k',
      '-f',
      'mp3',
      outputName
    );
  } else if (configuredOutputAudioFormat === 'wav') {
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
  } else {
    // Default to AAC or copy
    args.push('-acodec', 'copy', outputName);
  }

  await ffmpeg.exec(args);

  const extractedAudio = await ffmpeg.readFile(outputName);

  return new File(
    [
      new Blob([extractedAudio], {
        type: `audio/${configuredOutputAudioFormat}`
      })
    ],
    `${input.name.replace(
      /\.[^/.]+$/,
      ''
    )}_audio.${configuredOutputAudioFormat}`,
    { type: `audio/${configuredOutputAudioFormat}` }
  );
}
