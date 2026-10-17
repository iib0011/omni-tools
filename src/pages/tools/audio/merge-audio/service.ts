import { runFFmpegTask } from 'lib/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { InitialValuesType } from './types';

export async function mergeAudioFiles(
  inputs: File[],
  options: InitialValuesType
): Promise<File> {
  return runFFmpegTask(async ({ ffmpeg, tempFile }) => {
    const { outputFormat } = options;

    const tempWavNames: string[] = [];
    const fileListName = tempFile('.txt');
    const concatWavName = tempFile('.wav');
    const outputName = tempFile(`.${outputFormat}`);

    for (let i = 0; i < inputs.length; i++) {
      const inputName = tempFile(
        `.${inputs[i].name.split('.').pop() ?? 'tmp'}`
      );
      const tempWavName = tempFile('.wav');

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
    }

    // Build concat file list
    const fileListContent = tempWavNames
      .map((name) => `file '${name}'`)
      .join('\n');

    await ffmpeg.writeFile(fileListName, fileListContent);

    // Concatenate WAV files
    await ffmpeg.exec([
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      fileListName,
      '-c',
      'copy',
      concatWavName
    ]);

    let finalOutput = concatWavName;

    if (outputFormat !== 'wav') {
      const args = ['-i', concatWavName];

      switch (outputFormat) {
        case 'mp3':
          args.push('-b:a', '192k', '-f', 'mp3', outputName);
          break;

        case 'aac':
          args.push('-c:a', 'aac', '-b:a', '192k', '-f', 'adts', outputName);
          break;
      }

      await ffmpeg.exec(args);
      finalOutput = outputName;
    }

    const data = await ffmpeg.readFile(finalOutput);

    return new File(
      [
        new Blob([new Uint8Array(data as Uint8Array)], {
          type: `audio/${outputFormat}`
        })
      ],
      `merged_audio.${outputFormat}`,
      {
        type: `audio/${outputFormat}`
      }
    );
  });
}
