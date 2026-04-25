import { expect, describe, it, vi, beforeEach } from 'vitest';
import { convertAudio } from './service';
import { InitialValuesType } from './types';

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

describe('convertAudio', () => {
  let mockInputFile: File;

  beforeEach(() => {
    const mockAudioData = new Uint8Array([1, 2, 3, 4, 5]);
    mockInputFile = new File([mockAudioData], 'input.aac', {
      type: 'audio/aac'
    });
  });

  it('should convert to MP3 format correctly', async () => {
    const options: InitialValuesType = { outputFormat: 'mp3' };
    const result = await convertAudio(mockInputFile, options);

    expect(result).toBeInstanceOf(File);
    expect(result.name).toBe('input.mp3');
    expect(result.type).toBe('audio/mpeg');
  });

  it('should convert to AAC format correctly', async () => {
    const options: InitialValuesType = { outputFormat: 'aac' };
    const result = await convertAudio(mockInputFile, options);

    expect(result).toBeInstanceOf(File);
    expect(result.name).toBe('input.aac');
    expect(result.type).toBe('audio/aac');
  });

  it('should convert to WAV format correctly', async () => {
    const options: InitialValuesType = { outputFormat: 'wav' };
    const result = await convertAudio(mockInputFile, options);

    expect(result).toBeInstanceOf(File);
    expect(result.name).toBe('input.wav');
    expect(result.type).toBe('audio/wav');
  });

  it('should convert to FLAC format correctly', async () => {
    const options: InitialValuesType = { outputFormat: 'flac' };
    const result = await convertAudio(mockInputFile, options);

    expect(result).toBeInstanceOf(File);
    expect(result.name).toBe('input.flac');
    expect(result.type).toBe('audio/flac');
  });

  it('should convert to OGG format correctly', async () => {
    const options: InitialValuesType = { outputFormat: 'ogg' };
    const result = await convertAudio(mockInputFile, options);

    expect(result).toBeInstanceOf(File);
    expect(result.name).toBe('input.ogg');
    expect(result.type).toBe('audio/ogg');
  });

  it('should return original file if input format matches output format', async () => {
    const options: InitialValuesType = { outputFormat: 'aac' };
    const result = await convertAudio(mockInputFile, options);

    expect(result).toBe(mockInputFile); // Same instance
    expect(result.name).toBe('input.aac');
  });

  it('should handle files without extensions', async () => {
    const fileNoExt = new File([new Uint8Array([1, 2, 3])], 'audiofile', {
      type: 'audio/aac'
    });
    const options: InitialValuesType = { outputFormat: 'mp3' };
    const result = await convertAudio(fileNoExt, options);

    expect(result).toBeInstanceOf(File);
    expect(result.name).toBe('audiofile.mp3');
    expect(result.type).toBe('audio/mpeg');
  });
});
