import { expect, describe, it, vi } from 'vitest';

// Mock FFmpeg since it doesn't support Node.js
vi.mock('@ffmpeg/ffmpeg', () => ({
  FFmpeg: vi.fn().mockImplementation(() => ({
    loaded: false,
    load: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
    exec: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4, 5])),
    deleteFile: vi.fn().mockResolvedValue(undefined)
  }))
}));

vi.mock('@ffmpeg/util', () => ({
  fetchFile: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4, 5]))
}));

import { mergeAudioFiles } from './service';

describe('mergeAudioFiles', () => {
  it('should merge multiple audio files', async () => {
    // Create mock audio files
    const mockAudioData1 = new Uint8Array([0, 1, 2, 3, 4, 5]);
    const mockAudioData2 = new Uint8Array([6, 7, 8, 9, 10, 11]);

    const mockFile1 = new File([mockAudioData1], 'test1.mp3', {
      type: 'audio/mp3'
    });
    const mockFile2 = new File([mockAudioData2], 'test2.mp3', {
      type: 'audio/mp3'
    });

    const options = {
      outputFormat: 'mp3' as const
    };

    const result = await mergeAudioFiles([mockFile1, mockFile2], options);
    expect(result).toBeInstanceOf(File);
    expect(result.name).toBe('merged_audio.mp3');
    expect(result.type).toBe('audio/mp3');
  });

  it('should handle different output formats', async () => {
    const mockAudioData = new Uint8Array([0, 1, 2, 3, 4, 5]);
    const mockFile = new File([mockAudioData], 'test.wav', {
      type: 'audio/wav'
    });

    const options = {
      outputFormat: 'aac' as const
    };

    const result = await mergeAudioFiles([mockFile], options);
    expect(result).toBeInstanceOf(File);
    expect(result.name).toBe('merged_audio.aac');
    expect(result.type).toBe('audio/aac');
  });

  it('should throw error when no input files provided', async () => {
    const options = {
      outputFormat: 'mp3' as const
    };

    try {
      await mergeAudioFiles([], options);
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('No input files provided');
    }
  });
});
