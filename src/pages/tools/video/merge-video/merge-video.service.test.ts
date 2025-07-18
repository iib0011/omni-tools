import { expect, describe, it, vi } from 'vitest';

// Mock FFmpeg and fetchFile to avoid Node.js compatibility issues
vi.mock('@ffmpeg/ffmpeg', () => ({
  FFmpeg: vi.fn().mockImplementation(() => ({
    loaded: false,
    load: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
    exec: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4])),
    deleteFile: vi.fn().mockResolvedValue(undefined)
  }))
}));

vi.mock('@ffmpeg/util', () => ({
  fetchFile: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4]))
}));

// Import after mocking
import { mergeVideos } from './service';

function createMockFile(name: string, type = 'video/mp4') {
  return new File([new Uint8Array([0, 1, 2])], name, { type });
}

describe('merge-video', () => {
  it('throws if less than two files are provided', async () => {
    await expect(mergeVideos([], {})).rejects.toThrow(
      'Please provide at least two video files to merge.'
    );
    await expect(mergeVideos([createMockFile('a.mp4')], {})).rejects.toThrow(
      'Please provide at least two video files to merge.'
    );
  });

  it('throws if input is not an array', async () => {
    // @ts-ignore - testing invalid input
    await expect(mergeVideos(null, {})).rejects.toThrow(
      'Please provide at least two video files to merge.'
    );
  });

  it('successfully merges video files (mocked)', async () => {
    const mockFile1 = createMockFile('video1.mp4');
    const mockFile2 = createMockFile('video2.mp4');

    const result = await mergeVideos([mockFile1, mockFile2], {});

    expect(result).toBeInstanceOf(Blob);
    expect(result.type).toBe('video/mp4');
  });

  it('handles different video formats by re-encoding', async () => {
    const mockFile1 = createMockFile('video1.avi', 'video/x-msvideo');
    const mockFile2 = createMockFile('video2.mov', 'video/quicktime');

    const result = await mergeVideos([mockFile1, mockFile2], {});

    expect(result).toBeInstanceOf(Blob);
    expect(result.type).toBe('video/mp4');
  });
});
