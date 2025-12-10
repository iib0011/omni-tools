import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { InitialValuesType, AUDIO_FORMATS } from './types';
import { getFileExtension } from 'utils/file';

/**
 * optimzed call for FFmpeg instance creation,
 * avoiding to download required FFmpeg binaries on every reload
 */
const ffmpeg = new FFmpeg();
let isLoaded = false;

async function loadFFmpeg() {
  if (!isLoaded) {
    await ffmpeg.load();
    isLoaded = true;
  }
}

/**
 * Converts input audio file to selected output format ('mp3', 'aac', or 'wav').
 * Supports any input audio file type accepted by FFmpeg.
 *
 * @param input - Source audio File
 * @param outputFormat - 'mp3' | 'aac' | 'wav'
 * @returns Converted audio File
 */
export async function convertAudio(
  input: File,
  options: InitialValuesType
): Promise<File> {
  await loadFFmpeg();

  // Use the original input extension for input filename
  const inputExt = getFileExtension(input.name);

  if (inputExt === options.outputFormat) return input;

  const inputFileName = inputExt ? `input.${inputExt}` : 'input';
  const outputFileName = `output.${options.outputFormat}`;

  // Write the input file to FFmpeg FS
  await ffmpeg.writeFile(inputFileName, await fetchFile(input));

  // Build the FFmpeg args depending on the output format
  // You can customize the codec and bitrate options per format here

  const format = AUDIO_FORMATS[options.outputFormat];
  const { codec, bitrate, mimeType } = format;

  const args = bitrate
    ? ['-i', inputFileName, '-c:a', codec, '-b:a', bitrate, outputFileName]
    : ['-i', inputFileName, '-c:a', codec, outputFileName];

  // Execute ffmpeg with arguments
  try {
    await ffmpeg.exec(args);

    // Read the output file from FFmpeg FS
    const data = await ffmpeg.readFile(outputFileName);

    // Create a new File with the original name but new extension
    const baseName = input.name.replace(/\.[^.]+$/, '');
    const convertedFileName = `${baseName}.${options.outputFormat}`;

    return new File(
      [new Blob([data as any], { type: mimeType })],
      convertedFileName,
      {
        type: mimeType
      }
    );
  } finally {
    // Clean up FFmpeg virtual filesystem
    try {
      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile(outputFileName);
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}
