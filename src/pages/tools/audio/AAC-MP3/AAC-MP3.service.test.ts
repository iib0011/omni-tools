import { describe, it, expect, vi } from 'vitest';

// Mock FFmpeg and fetchFile
vi.mock('@ffmpeg/ffmpeg', () => ({
  FFmpeg: vi.fn().mockImplementation(() => ({
    load: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
    exec: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn().mockReturnValue(new Uint8Array([1, 2, 3, 4, 5])),
    unlink: vi.fn().mockResolvedValue(undefined)
  }))
}));

vi.mock('@ffmpeg/util', () => ({
  fetchFile: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4, 5]))
}));

// Import service
import { AACtoMp3 } from './service';

describe('convertAACtoMP3', () => {
  it('should return a new MP3 File when given a valid AAC file', async () => {
    const mockAACData = new Uint8Array([0, 1, 2, 3, 4, 5]);
    const mockFile = new File([mockAACData], 'sample.aac', {
      type: 'audio/aac'
    });

    const result = await AACtoMp3(mockFile);

    expect(result).toBeInstanceOf(File);
    expect(result.name).toBe('sample.mp3');
    expect(result.type).toBe('audio/mpeg');
  });

  it('should throw error if file type is not AAC', async () => {
    const mockFile = new File(['dummy'], 'song.wav', {
      type: 'audio/wav'
    });

    await expect(() => AACtoMp3(mockFile)).rejects.toThrowError(
      'Only .aac files are allowed.' // FIXED to match actual error
    );
  });
});
