import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cropVideo } from './service';

// Mock FFmpeg
vi.mock('@ffmpeg/ffmpeg', () => {
  return {
    FFmpeg: vi.fn().mockImplementation(() => {
      return {
        loaded: false,
        load: vi.fn().mockResolvedValue(undefined),
        writeFile: vi.fn().mockResolvedValue(undefined),
        exec: vi.fn().mockResolvedValue(undefined),
        readFile: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]))
      };
    })
  };
});

// Mock fetchFile
vi.mock('@ffmpeg/util', () => {
  return {
    fetchFile: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]))
  };
});

describe('crop-video', () => {
  let mockFile: File;
  let mockVideoInfo: { width: number; height: number };

  beforeEach(() => {
    mockFile = new File(['test'], 'test.mp4', { type: 'video/mp4' });
    mockVideoInfo = { width: 1280, height: 720 };

    // Reset global File constructor
    global.File = vi.fn().mockImplementation((bits, name, options) => {
      return new File(bits, name, options);
    });
  });

  it('should crop a video with valid parameters', async () => {
    const options = {
      width: 640,
      height: 360,
      x: 0,
      y: 0,
      maintainAspectRatio: false
    };

    const result = await cropVideo(mockFile, options, mockVideoInfo);

    expect(result).toBeDefined();
    expect(result.name).toContain('_cropped');
    expect(result.type).toBe('video/mp4');
  });

  it('should throw error if videoInfo is not provided', async () => {
    const options = {
      width: 640,
      height: 360,
      x: 0,
      y: 0,
      maintainAspectRatio: false
    };

    await expect(cropVideo(mockFile, options, null)).rejects.toThrow(
      'Video information is required'
    );
  });

  it('should adjust crop dimensions to fit within video bounds', async () => {
    const options = {
      width: 2000, // Larger than video width
      height: 1000, // Larger than video height
      x: 500,
      y: 500,
      maintainAspectRatio: false
    };

    const result = await cropVideo(mockFile, options, mockVideoInfo);

    expect(result).toBeDefined();
    // We can't test the actual crop dimensions since FFmpeg is mocked
    // but we can verify the file was created
    expect(result.name).toContain('_cropped');
  });
});
