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

  // 1. Convert all inputs to WAV
  const tempWavNames: string[] = [];
  for (let i = 0; i < inputs.length; i++) {
    const inputName = `input${i}`;
    const tempWavName = `temp${i}.wav`;
    await ffmpeg.writeFile(inputName, await fetchFile(inputs[i]));
    await ffmpeg.exec([
      '-i',
      inputName,
      '-acodec',
      'pcm_s16le',
      '-ar',
      '44100',
      '-ac',
      '2',
      tempWavName
    ]);
    tempWavNames.push(tempWavName);
    await ffmpeg.deleteFile(inputName);
  }

  // 2. Create file list for concat
  const fileListName = 'filelist.txt';
  const fileListContent = tempWavNames
    .map((name) => `file '${name}'`)
    .join('\n');
  await ffmpeg.writeFile(fileListName, fileListContent);

  // 3. Concatenate WAV files
  const concatWav = 'concat.wav';
  await ffmpeg.exec([
    '-f',
    'concat',
    '-safe',
    '0',
    '-i',
    fileListName,
    '-c',
    'copy',
    concatWav
  ]);

  // 4. Convert concatenated WAV to requested output format
  let finalOutput = concatWav;
  if (outputFormat !== 'wav') {
    const args = ['-i', concatWav];
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
    }
    await ffmpeg.exec(args);
    finalOutput = outputName;
  }

  const mergedAudio = await ffmpeg.readFile(finalOutput);

  let mimeType = 'audio/wav';
  if (outputFormat === 'mp3') mimeType = 'audio/mp3';
  if (outputFormat === 'aac') mimeType = 'audio/aac';

  // Clean up files
  for (const tempWavName of tempWavNames) {
    await ffmpeg.deleteFile(tempWavName);
  }
  await ffmpeg.deleteFile(fileListName);
  await ffmpeg.deleteFile(concatWav);
  if (outputFormat !== 'wav') {
    await ffmpeg.deleteFile(outputName);
  }

  return new File(
    [
      new Blob([mergedAudio as any], {
        type: mimeType
      })
    ],
    `merged_audio.${outputFormat}`,
    { type: mimeType }
  );
}
