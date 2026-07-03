import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;
let loadPromise: Promise<void> | null = null;

export async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance;

  if (!loadPromise) {
    loadPromise = (async () => {
      const ffmpeg = new FFmpeg();
      const baseURL =
        'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm';
      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          'text/javascript'
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          'application/wasm'
        )
      });
      ffmpegInstance = ffmpeg;
    })();
  }

  await loadPromise;
  return ffmpegInstance!;
}

export { fetchFile, toBlobURL };
