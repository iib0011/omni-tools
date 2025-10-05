import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

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
  outputFormat: 'mp3' | 'aac' | 'wav'
): Promise<File> {
  await loadFFmpeg();

  // Use the original input extension for input filename
  const inputExtMatch = input.name.match(/\.[^.]+$/);
  const inputExt = inputExtMatch ? inputExtMatch[0] : '.audio';

  const inputFileName = `input${inputExt}`;
  const outputFileName = `output.${outputFormat}`;

  // Write the input file to FFmpeg FS
  await ffmpeg.writeFile(inputFileName, await fetchFile(input));

  // Build the FFmpeg args depending on the output format
  // You can customize the codec and bitrate options per format here
  let args: string[];

  switch (outputFormat) {
    case 'mp3':
      args = [
        '-i',
        inputFileName,
        '-c:a',
        'libmp3lame',
        '-b:a',
        '192k',
        outputFileName
      ];
      break;

    case 'aac':
      args = [
        '-i',
        inputFileName,
        '-c:a',
        'aac',
        '-b:a',
        '192k',
        outputFileName
      ];
      break;

    case 'wav':
      args = ['-i', inputFileName, '-c:a', 'pcm_s16le', outputFileName];
      break;

    default:
      throw new Error(`Unsupported output format: ${outputFormat}`);
  }

  // Execute ffmpeg with arguments
  await ffmpeg.exec(args);

  // Read the output file from FFmpeg FS
  const data = await ffmpeg.readFile(outputFileName);

  // Determine MIME type by outputFormat
  let mimeType = '';
  switch (outputFormat) {
    case 'mp3':
      mimeType = 'audio/mpeg';
      break;
    case 'aac':
      mimeType = 'audio/aac';
      break;
    case 'wav':
      mimeType = 'audio/wav';
      break;
  }

  // Create a new File with the original name but new extension
  const baseName = input.name.replace(/\.[^.]+$/, '');
  const convertedFileName = `${baseName}.${outputFormat}`;

  return new File([data], convertedFileName, { type: mimeType });
}
