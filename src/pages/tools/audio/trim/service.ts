import { runFFmpegTask } from 'lib/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { getFileExtension } from '@utils/file';
import { InitialValuesType } from './types';

export async function trimAudio(
  input: File,
  options: InitialValuesType
): Promise<File> {
  return runFFmpegTask(async ({ ffmpeg, tempFile }) => {
    const { startTime, endTime, outputFormat } = options;
    const inputName = tempFile(getFileExtension(input.name));
    const outputName = tempFile(`.${outputFormat}`);

    await ffmpeg.writeFile(inputName, await fetchFile(input));

    let args: string[] = [
      '-i',
      inputName,
      '-ss',
      startTime, // Start time
      '-to',
      endTime, // End time
      '-c',
      'copy'
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

    const blob = new Blob([new Uint8Array(trimmedAudio as Uint8Array)], {
      type: `audio/${outputFormat}`
    });

    return new File(
      [blob],
      `${input.name.replace(/\.[^/.]+$/, '')}_trimmed.${outputFormat}`,
      { type: `audio/${outputFormat}` }
    );
  });
}
