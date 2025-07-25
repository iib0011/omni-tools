import { expect, describe, it, vi, beforeEach } from 'vitest';

// Mock FFmpeg since it doesn't support Node.js in tests
vi.mock('@ffmpeg/ffmpeg', () => ({
  FFmpeg: vi.fn().mockImplementation(() => ({
    loaded: false,
    load: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
    exec: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn().mockResolvedValue(new Uint8Array([10, 20, 30, 40, 50])),
    deleteFile: vi.fn().mockResolvedValue(undefined)
  }))
}));

vi.mock('@ffmpeg/util', () => ({
  fetchFile: vi.fn().mockResolvedValue(new Uint8Array([10, 20, 30, 40, 50]))
}));

import { convertAudio } from './service';

describe('convertAudio', () => {
  let mockInputFile: File;

  beforeEach(() => {
    const mockAudioData = new Uint8Array([1, 2, 3, 4, 5]);
    mockInputFile = new File([mockAudioData], 'input.aac', {
      type: 'audio/aac'
    });
  });

  it('should convert to MP3 format correctly', async () => {
    const outputFormat = 'mp3' as const;
    const result = await convertAudio(mockInputFile, outputFormat);

    expect(result).toBeInstanceOf(File);
    expect(result.name).toBe('input.mp3'); // base name + outputFormat extension
    expect(result.type).toBe('audio/mpeg');
  });

  it('should convert to AAC format correctly', async () => {
    const outputFormat = 'aac' as const;
    const result = await convertAudio(mockInputFile, outputFormat);

    expect(result).toBeInstanceOf(File);
    expect(result.name).toBe('input.aac');
    expect(result.type).toBe('audio/aac');
  });

  it('should convert to WAV format correctly', async () => {
    const outputFormat = 'wav' as const;
    const result = await convertAudio(mockInputFile, outputFormat);

    expect(result).toBeInstanceOf(File);
    expect(result.name).toBe('input.wav');
    expect(result.type).toBe('audio/wav');
  });

  it('should throw error for unsupported formats', async () => {
    // @ts-expect-error - intentionally passing unsupported format
    await expect(convertAudio(mockInputFile, 'flac')).rejects.toThrow(
      'Unsupported output format'
    );
  });
});
