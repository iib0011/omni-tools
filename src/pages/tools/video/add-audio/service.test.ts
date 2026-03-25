import { expect, describe, it, vi, beforeEach } from 'vitest';
import { timeToSeconds } from './service';

const { mockExec } = vi.hoisted(() => ({
  mockExec: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('@ffmpeg/ffmpeg', () => ({
  FFmpeg: vi.fn().mockImplementation(() => ({
    loaded: false,
    load: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
    exec: mockExec,
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

const defaultOptions = {
  mode: 'replace' as const,
  volume: 100,
  loop: true,
  startTime: '00:00:00',
  endTime: '00:00:00'
};

describe('timeToSeconds', () => {
  it('should convert HH:MM:SS to seconds', () => {
    expect(timeToSeconds('00:00:00')).toBe(0);
    expect(timeToSeconds('00:01:00')).toBe(60);
    expect(timeToSeconds('01:00:00')).toBe(3600);
    expect(timeToSeconds('00:00:30')).toBe(30);
    expect(timeToSeconds('01:30:45')).toBe(5445);
  });

  it('should handle MM:SS format', () => {
    expect(timeToSeconds('01:30')).toBe(90);
  });
});

describe('add-audio-to-video', () => {
  beforeEach(() => {
    mockExec.mockClear();
  });

  it('should add audio to video in replace mode', async () => {
    const video = createMockFile('video.mp4', 'video/mp4');
    const audio = createMockFile('audio.mp3', 'audio/mpeg');

    const result = await addAudioToVideo(video, audio, defaultOptions);

    expect(result).toBeInstanceOf(File);
    expect(result.type).toBe('video/mp4');
    expect(result.name).toBe('video_with_audio.mp4');
  });

  it('should add audio to video in mix mode', async () => {
    const video = createMockFile('video.mp4', 'video/mp4');
    const audio = createMockFile('audio.mp3', 'audio/mpeg');

    const result = await addAudioToVideo(video, audio, {
      ...defaultOptions,
      mode: 'mix'
    });

    expect(result).toBeInstanceOf(File);
    expect(result.type).toBe('video/mp4');
    expect(result.name).toBe('video_with_audio.mp4');
  });

  it('should handle custom volume', async () => {
    const video = createMockFile('video.mp4', 'video/mp4');
    const audio = createMockFile('audio.mp3', 'audio/mpeg');

    const result = await addAudioToVideo(video, audio, {
      ...defaultOptions,
      volume: 50
    });

    expect(result).toBeInstanceOf(File);
    expect(result.type).toBe('video/mp4');
  });

  it('should preserve video name in output', async () => {
    const video = createMockFile('my-video.mp4', 'video/mp4');
    const audio = createMockFile('song.mp3', 'audio/mpeg');

    const result = await addAudioToVideo(video, audio, defaultOptions);

    expect(result.name).toBe('my-video_with_audio.mp4');
  });

  it('should handle video files with complex names', async () => {
    const video = createMockFile('my.video.file.mp4', 'video/mp4');
    const audio = createMockFile('audio.mp3', 'audio/mpeg');

    const result = await addAudioToVideo(video, audio, {
      ...defaultOptions,
      mode: 'mix',
      volume: 150
    });

    expect(result).toBeInstanceOf(File);
    expect(result.name).toBe('my.video.file_with_audio.mp4');
  });

  it('should use -stream_loop when loop is true', async () => {
    const video = createMockFile('video.mp4', 'video/mp4');
    const audio = createMockFile('audio.mp3', 'audio/mpeg');

    await addAudioToVideo(video, audio, { ...defaultOptions, loop: true });

    const args = mockExec.mock.calls[0][0];
    expect(args).toContain('-stream_loop');
    expect(args).toContain('-1');
  });

  it('should not use -stream_loop when loop is false', async () => {
    const video = createMockFile('video.mp4', 'video/mp4');
    const audio = createMockFile('audio.mp3', 'audio/mpeg');

    await addAudioToVideo(video, audio, { ...defaultOptions, loop: false });

    const args = mockExec.mock.calls[0][0];
    expect(args).not.toContain('-stream_loop');
  });

  it('should use -shortest when no duration constraint', async () => {
    const video = createMockFile('video.mp4', 'video/mp4');
    const audio = createMockFile('audio.mp3', 'audio/mpeg');

    await addAudioToVideo(video, audio, defaultOptions);

    const args = mockExec.mock.calls[0][0];
    expect(args).toContain('-shortest');
  });

  it('should use adelay when start time is set', async () => {
    const video = createMockFile('video.mp4', 'video/mp4');
    const audio = createMockFile('audio.mp3', 'audio/mpeg');

    await addAudioToVideo(video, audio, {
      ...defaultOptions,
      startTime: '00:00:10',
      endTime: '00:00:00'
    });

    const args = mockExec.mock.calls[0][0];
    const filterIdx = args.indexOf('-filter_complex');
    const filter = args[filterIdx + 1];
    expect(filter).toContain('adelay=10000|10000');
    expect(filter).toContain('apad');
  });

  it('should use atrim when both start and end time are set', async () => {
    const video = createMockFile('video.mp4', 'video/mp4');
    const audio = createMockFile('audio.mp3', 'audio/mpeg');

    await addAudioToVideo(video, audio, {
      ...defaultOptions,
      startTime: '00:00:10',
      endTime: '00:00:30'
    });

    const args = mockExec.mock.calls[0][0];
    const filterIdx = args.indexOf('-filter_complex');
    const filter = args[filterIdx + 1];
    expect(filter).toContain('atrim=start=0:end=20');
    expect(filter).toContain('adelay=10000|10000');
    expect(filter).toContain('apad');
  });

  it('should use atrim when only end time is set', async () => {
    const video = createMockFile('video.mp4', 'video/mp4');
    const audio = createMockFile('audio.mp3', 'audio/mpeg');

    await addAudioToVideo(video, audio, {
      ...defaultOptions,
      startTime: '00:00:00',
      endTime: '00:00:20'
    });

    const args = mockExec.mock.calls[0][0];
    const filterIdx = args.indexOf('-filter_complex');
    const filter = args[filterIdx + 1];
    expect(filter).toContain('atrim=start=0:end=20');
    expect(filter).toContain('apad');
    expect(filter).not.toContain('adelay');
  });

  it('should combine loop with start/end time', async () => {
    const video = createMockFile('video.mp4', 'video/mp4');
    const audio = createMockFile('audio.mp3', 'audio/mpeg');

    await addAudioToVideo(video, audio, {
      ...defaultOptions,
      loop: true,
      startTime: '00:00:05',
      endTime: '00:01:00'
    });

    const args = mockExec.mock.calls[0][0];
    expect(args).toContain('-stream_loop');
    const filterIdx = args.indexOf('-filter_complex');
    const filter = args[filterIdx + 1];
    expect(filter).toContain('atrim=start=0:end=55');
    expect(filter).toContain('adelay=5000|5000');
  });

  it('should handle mix mode with duration constraint', async () => {
    const video = createMockFile('video.mp4', 'video/mp4');
    const audio = createMockFile('audio.mp3', 'audio/mpeg');

    await addAudioToVideo(video, audio, {
      ...defaultOptions,
      mode: 'mix',
      startTime: '00:00:10',
      endTime: '00:00:30'
    });

    const args = mockExec.mock.calls[0][0];
    const filterIdx = args.indexOf('-filter_complex');
    const filter = args[filterIdx + 1];
    expect(filter).toContain('amerge');
    expect(filter).toContain('apad');
    expect(args).not.toContain('-shortest');
  });
});
