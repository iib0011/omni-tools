import { expect, describe, it, vi } from 'vitest';

vi.mock('@ffmpeg/ffmpeg', () => ({
  FFmpeg: vi.fn().mockImplementation(() => ({
    loaded: false,
    load: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
    exec: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4]))
  }))
}));

vi.mock('@ffmpeg/util', () => ({
  fetchFile: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4]))
}));

import { addAudioToVideo } from './service';

function createMockFile(name: string, type: string) {
  return new File([new Uint8Array([0, 1, 2])], name, { type });
}

describe('add-audio-to-video', () => {
  it('should add audio to video in replace mode', async () => {
    const video = createMockFile('video.mp4', 'video/mp4');
    const audio = createMockFile('audio.mp3', 'audio/mpeg');

    const result = await addAudioToVideo(video, audio, {
      mode: 'replace',
      volume: 100
    });

    expect(result).toBeInstanceOf(File);
    expect(result.type).toBe('video/mp4');
    expect(result.name).toBe('video_with_audio.mp4');
  });

  it('should add audio to video in mix mode', async () => {
    const video = createMockFile('video.mp4', 'video/mp4');
    const audio = createMockFile('audio.mp3', 'audio/mpeg');

    const result = await addAudioToVideo(video, audio, {
      mode: 'mix',
      volume: 100
    });

    expect(result).toBeInstanceOf(File);
    expect(result.type).toBe('video/mp4');
    expect(result.name).toBe('video_with_audio.mp4');
  });

  it('should handle custom volume', async () => {
    const video = createMockFile('video.mp4', 'video/mp4');
    const audio = createMockFile('audio.mp3', 'audio/mpeg');

    const result = await addAudioToVideo(video, audio, {
      mode: 'replace',
      volume: 50
    });

    expect(result).toBeInstanceOf(File);
    expect(result.type).toBe('video/mp4');
  });

  it('should preserve video name in output', async () => {
    const video = createMockFile('my-video.mp4', 'video/mp4');
    const audio = createMockFile('song.mp3', 'audio/mpeg');

    const result = await addAudioToVideo(video, audio, {
      mode: 'replace',
      volume: 100
    });

    expect(result.name).toBe('my-video_with_audio.mp4');
  });

  it('should handle video files with complex names', async () => {
    const video = createMockFile('my.video.file.mp4', 'video/mp4');
    const audio = createMockFile('audio.mp3', 'audio/mpeg');

    const result = await addAudioToVideo(video, audio, {
      mode: 'mix',
      volume: 150
    });

    expect(result).toBeInstanceOf(File);
    expect(result.name).toBe('my.video.file_with_audio.mp4');
  });
});
