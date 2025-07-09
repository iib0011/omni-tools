import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { InitialValuesType } from './types';

const ffmpeg = new FFmpeg();

export async function trimAudio(
  input: File,
  options: InitialValuesType
): Promise<File> {
  if (!ffmpeg.loaded) {
    await ffmpeg.load({
      wasmURL:
        'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.9/dist/esm/ffmpeg-core.wasm'
    });
  }

  const inputName = 'input.mp3';
  await ffmpeg.writeFile(inputName, await fetchFile(input));

  const { startTime, endTime, outputFormat } = options;
  const outputName = `output.${outputFormat}`;

  // Build FFmpeg arguments for trimming
  let args: string[] = [
    '-i',
    inputName,
    '-ss',
    startTime, // Start time
    '-to',
    endTime, // End time
    '-c',
    'copy' // Copy without re-encoding for speed
  ];

  // Add format-specific arguments
  if (outputFormat === 'mp3') {
    args = [
      '-i',
      inputName,
      '-ss',
      startTime,
      '-to',
      endTime,
      '-ar',
      '44100',
      '-ac',
      '2',
      '-b:a',
      '192k',
      '-f',
      'mp3',
      outputName
    ];
  } else if (outputFormat === 'aac') {
    args = [
      '-i',
      inputName,
      '-ss',
      startTime,
      '-to',
      endTime,
      '-c:a',
      'aac',
      '-b:a',
      '192k',
      '-f',
      'adts',
      outputName
    ];
  } else if (outputFormat === 'wav') {
    args = [
      '-i',
      inputName,
      '-ss',
      startTime,
      '-to',
      endTime,
      '-acodec',
      'pcm_s16le',
      '-ar',
      '44100',
      '-ac',
      '2',
      '-f',
      'wav',
      outputName
    ];
  }

  await ffmpeg.exec(args);

  const trimmedAudio = await ffmpeg.readFile(outputName);

  let mimeType = 'audio/mp3';
  if (outputFormat === 'aac') mimeType = 'audio/aac';
  if (outputFormat === 'wav') mimeType = 'audio/wav';

  return new File(
    [
      new Blob([trimmedAudio], {
        type: mimeType
      })
    ],
    `${input.name.replace(/\.[^/.]+$/, '')}_trimmed.${outputFormat}`,
    { type: mimeType }
  );
}
