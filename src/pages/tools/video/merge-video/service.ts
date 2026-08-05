import { fetchFile } from '@ffmpeg/util';
import { runFFmpegTask } from 'lib/ffmpeg';

export async function mergeVideos(input: File[]): Promise<File> {
  if (!Array.isArray(input) || input.length < 2) {
    throw new Error('Please provide at least two video files to merge.');
  }

  return runFFmpegTask(async ({ ffmpeg, tempFile }) => {
    const fileNames: string[] = [];
    const outputName = tempFile('.mp4');
    const concatListName = tempFile('.txt');

    for (let i = 0; i < input.length; i++) {
      const fileName = tempFile('.mp4');

      fileNames.push(fileName);

      await ffmpeg.writeFile(fileName, await fetchFile(input[i]));
    }

    // Create concat file
    const concatList = fileNames.map((name) => `file '${name}'`).join('\n');

    await ffmpeg.writeFile(
      concatListName,
      new TextEncoder().encode(concatList)
    );

    await ffmpeg.exec([
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      concatListName,
      '-c:v',
      'libx264',
      '-preset',
      'ultrafast',
      '-crf',
      '30',
      '-c:a',
      'aac',
      outputName
    ]);

    const data = await ffmpeg.readFile(outputName);

    const blob = new Blob([new Uint8Array(data as Uint8Array)], {
      type: 'video/mp4'
    });

    return new File(
      [blob],
      `${input[0].name.replace(/\.[^/.]+$/, '')}_merged_with_${
        input.length - 1
      }_videos.mp4`,
      { type: 'video/mp4' }
    );
  });
}
