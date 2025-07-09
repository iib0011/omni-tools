import { describe, it, expect, vi, beforeAll } from 'vitest';

// Mock the service module BEFORE importing it
vi.mock('./service', () => ({
  extractAudioFromVideo: vi.fn(async (input, options) => {
    const ext = options.outputFormat;
    return new File([new Blob(['audio data'])], `mock_audio.${ext}`, {
      type: `audio/${ext}`
    });
  })
}));

import { extractAudioFromVideo } from './service';
import { InitialValuesType } from './types';

function createMockVideoFile(): File {
  return new File(['video data'], 'test.mp4', { type: 'video/mp4' });
}

describe('extractAudioFromVideo (mocked)', () => {
  let videoFile: File;

  beforeAll(() => {
    videoFile = createMockVideoFile();
  });

  it('should extract audio as AAC', async () => {
    const options: InitialValuesType = { outputFormat: 'aac' };
    const audioFile = await extractAudioFromVideo(videoFile, options);
    expect(audioFile).toBeInstanceOf(File);
    expect(audioFile.name.endsWith('.aac')).toBe(true);
    expect(audioFile.type).toBe('audio/aac');
  });

  it('should extract audio as MP3', async () => {
    const options: InitialValuesType = { outputFormat: 'mp3' };
    const audioFile = await extractAudioFromVideo(videoFile, options);
    expect(audioFile).toBeInstanceOf(File);
    expect(audioFile.name.endsWith('.mp3')).toBe(true);
    expect(audioFile.type).toBe('audio/mp3');
  });

  it('should extract audio as WAV', async () => {
    const options: InitialValuesType = { outputFormat: 'wav' };
    const audioFile = await extractAudioFromVideo(videoFile, options);
    expect(audioFile).toBeInstanceOf(File);
    expect(audioFile.name.endsWith('.wav')).toBe(true);
    expect(audioFile.type).toBe('audio/wav');
  });
});
