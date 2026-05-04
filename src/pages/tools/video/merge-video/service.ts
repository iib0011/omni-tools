import { InitialValuesType, MergeVideoInput, MergeVideoOutput } from './types';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

export async function mergeVideos(
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
    // Load FFmpeg with proper error handling
    if (!ffmpeg.loaded) {
      await ffmpeg.load({
        wasmURL:
          'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.9/dist/esm/ffmpeg-core.wasm',
        workerURL:
          'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.9/dist/esm/ffmpeg-core.worker.js'
      });
    }

    // Write all input files to ffmpeg FS with better error handling
    for (let i = 0; i < input.length; i++) {
      const fileName = `input${i}.mp4`;
      fileNames.push(fileName);

      try {
        const fileData = await fetchFile(input[i]);
        await ffmpeg.writeFile(fileName, fileData);
        console.log(`Successfully wrote ${fileName}`);
      } catch (fileError) {
        console.error(`Failed to write ${fileName}:`, fileError);
        throw new Error(`Failed to process input file ${i + 1}: ${fileError}`);
      }
    }

    // Build the filter_complex string for concat filter
    const videoInputs = fileNames.map((_, idx) => `[${idx}:v]`).join(' ');
    const audioInputs = fileNames.map((_, idx) => `[${idx}:a]`).join(' ');
    const filterComplex = `${videoInputs} ${audioInputs} concat=n=${input.length}:v=1:a=1 [v] [a]`;

    // Build input arguments
    const inputArgs = [];
    for (const fileName of fileNames) {
      inputArgs.push('-i', fileName);
    }

    console.log('Starting FFmpeg processing...');
    console.log('Filter complex:', filterComplex);

    // Method 2: Fallback to concat demuxer
    try {
      console.log('Trying concat demuxer method...');

      const concatList = fileNames.map((name) => `file '${name}'`).join('\n');
      await ffmpeg.writeFile(
        'concat_list.txt',
        new TextEncoder().encode(concatList)
      );

      await ffmpeg.exec([
        '-f',
        'concat',
        '-safe',
        '0',
        '-i',
        'concat_list.txt',
        '-c:v',
        'libx264',
        '-preset',
        'ultrafast',
        '-crf',
        '30',
        '-threads',
        '0',
        '-y',
        outputName
      ]);

      // Check if output was created
      try {
        const testRead = await ffmpeg.readFile(outputName);
        if (testRead && testRead.length > 0) {
          console.log('Concat demuxer method succeeded');
        }
      } catch (readError) {
        console.log('Concat demuxer method failed to produce output');
      }
    } catch (execError) {
      console.error('Concat demuxer method failed:', execError);
    }

    // Check if output file exists and read it
    let mergedData;
    try {
      mergedData = await ffmpeg.readFile(outputName);
      console.log('Successfully read output file');
    } catch (readError) {
      console.error('Failed to read output file:', readError);
      throw new Error('Failed to read merged video file');
    }

    if (!mergedData || mergedData.length === 0) {
      throw new Error('Output file is empty or corrupted');
    }

    return new Blob([mergedData as any], { type: 'video/mp4' });
  } catch (error) {
    console.error('Error merging videos:', error);
    throw error instanceof Error
      ? error
      : new Error('Unknown error occurred during video merge');
  } finally {
    // Clean up temporary files with better error handling
    const filesToClean = [...fileNames, outputName, 'concat_list.txt'];

    for (const fileName of filesToClean) {
      try {
        await ffmpeg.deleteFile(fileName);
      } catch (cleanupError) {
        // Ignore cleanup errors - they're not critical
        console.warn(`Could not delete ${fileName}:`, cleanupError);
      }
    }
  }
}
