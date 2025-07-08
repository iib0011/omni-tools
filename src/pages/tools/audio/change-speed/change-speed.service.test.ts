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

import { changeAudioSpeed } from './service';
import { InitialValuesType } from './types';

describe('changeAudioSpeed', () => {
  it('should return a new File with the correct name and type', async () => {
    const mockAudioData = new Uint8Array([0, 1, 2, 3, 4, 5]);
    const mockFile = new File([mockAudioData], 'test.mp3', {
      type: 'audio/mp3'
    });
    const options: InitialValuesType = {
      newSpeed: 2,
      outputFormat: 'mp3'
    };
    const result = await changeAudioSpeed(mockFile, options);
    expect(result).toBeInstanceOf(File);
    expect(result?.name).toBe('test-2x.mp3');
    expect(result?.type).toBe('audio/mp3');
  });

  it('should return null if input is null', async () => {
    const options: InitialValuesType = {
      newSpeed: 2,
      outputFormat: 'mp3'
    };
    const result = await changeAudioSpeed(null, options);
    expect(result).toBeNull();
  });
});
