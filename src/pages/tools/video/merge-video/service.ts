import { InitialValuesType, MergeVideoInput, MergeVideoOutput } from './types';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

// This function will use ffmpeg.wasm to merge multiple video files in the browser.
// Returns a Promise that resolves to a Blob of the merged video.
export async function main(
  input: MergeVideoInput,
  options: InitialValuesType
): Promise<MergeVideoOutput> {
  if (!Array.isArray(input) || input.length < 2) {
    throw new Error('Please provide at least two video files to merge.');
  }

  // Create a new FFmpeg instance for each operation to avoid conflicts
  const ffmpeg = new FFmpeg();

  const fileNames: string[] = [];
  const outputName = 'output.mp4';

  try {
    // Load FFmpeg
    if (!ffmpeg.loaded) {
      await ffmpeg.load({
        wasmURL:
          'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.9/dist/esm/ffmpeg-core.wasm'
      });
    }

    // Write all input files to ffmpeg FS
    fileNames.push(...input.map((file, idx) => `input${idx}.mp4`));
    for (let i = 0; i < input.length; i++) {
      await ffmpeg.writeFile(fileNames[i], await fetchFile(input[i]));
    }

    // Create concat list file
    const concatList = fileNames.map((name) => `file '${name}'`).join('\n');
    await ffmpeg.writeFile(
      'concat_list.txt',
      new TextEncoder().encode(concatList)
    );

    // Run ffmpeg concat demuxer
    await ffmpeg.exec([
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      'concat_list.txt',
      '-c',
      'copy',
      outputName
    ]);

    const mergedData = await ffmpeg.readFile(outputName);
    return new Blob([mergedData], { type: 'video/mp4' });
  } catch (error) {
    console.error('Error merging videos:', error);
    throw new Error(`Failed to merge videos: ${error}`);
  } finally {
    // Clean up temporary files
    try {
      for (const fileName of fileNames) {
        await ffmpeg.deleteFile(fileName);
      }
      await ffmpeg.deleteFile('concat_list.txt');
      await ffmpeg.deleteFile(outputName);
    } catch (cleanupError) {
      console.warn('Error cleaning up temporary files:', cleanupError);
    }
  }
}
