import { convertToGif } from './service';
import { InitialValuesType } from './types';

describe('convertToGif', () => {
  it('should convert video to GIF successfully', async () => {
    const mockVideoFile = new File(['mock'], 'mock.mp4', { type: 'video/mp4' });
    const mockOptions: InitialValuesType = {
      resolution: '720p',
      frameRate: 30
    };

    const result = await convertToGif(mockVideoFile, mockOptions);
    expect(result).toBe('converted-video.gif');
  });

  it('should throw an error for invalid input', async () => {
    const mockOptions: InitialValuesType = {
      resolution: '720p',
      frameRate: 30
    };

    await expect(convertToGif(null as any, mockOptions)).rejects.toThrow(
      'Invalid input or options'
    );
  });
});
