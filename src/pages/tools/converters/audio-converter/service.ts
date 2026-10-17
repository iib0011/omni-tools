import { fetchFile } from '@ffmpeg/util';
import { runFFmpegTask } from 'lib/ffmpeg';
import { InitialValuesType, AUDIO_FORMATS } from './types';
import { getFileExtension } from 'utils/file';

/**
 * Converts input audio file to selected output format.
 *
 * @param input - Source audio File
 * @param options - Conversion options
 * @returns Converted audio File
 */
export async function convertAudio(
  input: File,
  options: InitialValuesType
): Promise<File> {
  const inputExt = getFileExtension(input.name);

  if (inputExt === options.outputFormat) {
    return input;
  }

  return runFFmpegTask(async ({ ffmpeg, tempFile }) => {
    const inputFileName = tempFile(inputExt ? `.${inputExt}` : '');

    const outputFileName = tempFile(`.${options.outputFormat}`);

    await ffmpeg.writeFile(inputFileName, await fetchFile(input));

    const { codec, bitrate, mimeType } = AUDIO_FORMATS[options.outputFormat];

    const args = bitrate
      ? ['-i', inputFileName, '-c:a', codec, '-b:a', bitrate, outputFileName]
      : ['-i', inputFileName, '-c:a', codec, outputFileName];

    await ffmpeg.exec(args);

    const data = await ffmpeg.readFile(outputFileName);

    const blob = new Blob([new Uint8Array(data as Uint8Array)], {
      type: mimeType
    });

    const baseName = input.name.replace(/\.[^.]+$/, '');

    return new File([blob], `${baseName}.${options.outputFormat}`, {
      type: mimeType
    });
  });
}
