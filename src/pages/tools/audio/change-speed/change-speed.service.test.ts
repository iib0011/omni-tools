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

import { main } from './service';
import { InitialValuesType } from './types';

describe('changeSpeed (main)', () => {
  it('should return the input file unchanged (mock implementation)', () => {
    const mockAudioData = new Uint8Array([0, 1, 2, 3, 4, 5]);
    const mockFile = new File([mockAudioData], 'test.mp3', {
      type: 'audio/mp3'
    });
    const options: InitialValuesType = {
      newSpeed: 2,
      outputFormat: 'mp3'
    };
    const result = main(mockFile, options);
    expect(result).toBe(mockFile);
  });
});
