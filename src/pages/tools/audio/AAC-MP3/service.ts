import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();
let isLoaded = false;

export async function AACtoMp3(input: File): Promise<File> {
  if (!isLoaded) {
    await ffmpeg.load();
    isLoaded = true;
  }

  const inName = 'input.aac';
  const outName = 'output.mp3';

  await ffmpeg.writeFile(inName, await fetchFile(input));

  await ffmpeg.exec([
    '-i',
    inName,
    '-c:a',
    'libmp3lame',
    '-b:a',
    '192k',
    outName
  ]);

  const data = await ffmpeg.readFile(outName);

  const mp3 = new File([data], input.name.replace(/\.aac$/i, '.mp3'), {
    type: 'audio/mpeg'
  });

  return mp3;
}
