import { runFFmpegTask } from 'lib/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { InitialValuesType } from './types';

export async function extractAudioFromVideo(
  input: File,
  options: InitialValuesType
): Promise<File> {
  return runFFmpegTask(async ({ ffmpeg, tempFile }) => {
    const { outputFormat } = options;

    const inputName = tempFile('.mp4');
    const outputName = tempFile(`.${outputFormat}`);

    await ffmpeg.writeFile(inputName, await fetchFile(input));

    const args: string[] = ['-i', inputName, '-vn'];

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
    } else {
      // Default to AAC or copy
      args.push('-acodec', 'copy', outputName);
    }

    await ffmpeg.exec(args);

    const extractedAudio = await ffmpeg.readFile(outputName);

    const blob = new Blob([new Uint8Array(extractedAudio as Uint8Array)], {
      type: `audio/${outputFormat}`
    });

    return new File(
      [blob],
      `${input.name.replace(/\.[^/.]+$/, '')}_audio.${outputFormat}`,
      { type: `audio/${outputFormat}` }
    );
  });
}
