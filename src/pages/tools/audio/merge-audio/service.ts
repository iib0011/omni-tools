import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { InitialValuesType } from './types';

const ffmpeg = new FFmpeg();

export async function mergeAudioFiles(
  inputs: File[],
  options: InitialValuesType
): Promise<File> {
  if (!ffmpeg.loaded) {
    await ffmpeg.load({
      wasmURL:
        'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.9/dist/esm/ffmpeg-core.wasm'
    });
  }

  if (inputs.length === 0) {
    throw new Error('No input files provided');
  }

  const { outputFormat } = options;
  const outputName = `output.${outputFormat}`;

  // Write all input files to FFmpeg
  const inputNames: string[] = [];
  for (let i = 0; i < inputs.length; i++) {
    const inputName = `input${i}.mp3`;
    await ffmpeg.writeFile(inputName, await fetchFile(inputs[i]));
    inputNames.push(inputName);
  }

  // Create a file list for concatenation
  const fileListName = 'filelist.txt';
  const fileListContent = inputNames.map((name) => `file '${name}'`).join('\n');
  await ffmpeg.writeFile(fileListName, fileListContent);

  // Build FFmpeg arguments for merging
  let args: string[] = ['-f', 'concat', '-safe', '0', '-i', fileListName];

  // Add format-specific arguments
  if (outputFormat === 'mp3') {
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

  const mergedAudio = await ffmpeg.readFile(outputName);

  let mimeType = 'audio/mp3';
  if (outputFormat === 'aac') mimeType = 'audio/aac';
  if (outputFormat === 'wav') mimeType = 'audio/wav';

  // Clean up files
  for (const inputName of inputNames) {
    await ffmpeg.deleteFile(inputName);
  }
  await ffmpeg.deleteFile(fileListName);
  await ffmpeg.deleteFile(outputName);

  return new File(
    [
      new Blob([mergedAudio], {
        type: mimeType
      })
    ],
    `merged_audio.${outputFormat}`,
    { type: mimeType }
  );
}
