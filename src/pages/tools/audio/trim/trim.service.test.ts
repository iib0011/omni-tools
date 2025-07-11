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

import { trimAudio } from './service';

describe('trimAudio', () => {
  it('should trim audio file with valid time parameters', async () => {
    // Create a mock audio file
    const mockAudioData = new Uint8Array([0, 1, 2, 3, 4, 5]);
    const mockFile = new File([mockAudioData], 'test.mp3', {
      type: 'audio/mp3'
    });

    const options = {
      startTime: '00:00:10',
      endTime: '00:00:20',
      outputFormat: 'mp3' as const
    };

    const result = await trimAudio(mockFile, options);
    expect(result).toBeInstanceOf(File);
    expect(result.name).toContain('_trimmed.mp3');
    expect(result.type).toBe('audio/mp3');
  });

  it('should handle different output formats', async () => {
    const mockAudioData = new Uint8Array([0, 1, 2, 3, 4, 5]);
    const mockFile = new File([mockAudioData], 'test.wav', {
      type: 'audio/wav'
    });

    const options = {
      startTime: '00:00:00',
      endTime: '00:00:30',
      outputFormat: 'wav' as const
    };

    const result = await trimAudio(mockFile, options);
    expect(result).toBeInstanceOf(File);
    expect(result.name).toContain('_trimmed.wav');
    expect(result.type).toBe('audio/wav');
  });
});
