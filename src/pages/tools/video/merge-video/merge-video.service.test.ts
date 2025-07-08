import { expect, describe, it } from 'vitest';
import { main } from './service';

function createMockFile(name: string, type = 'video/mp4') {
  return new File([new Uint8Array([0, 1, 2])], name, { type });
}

describe('merge-video', () => {
  it('throws if less than two files are provided', async () => {
    await expect(main([], {})).rejects.toThrow();
    await expect(main([createMockFile('a.mp4')], {})).rejects.toThrow();
  });

  it('merges two video files (mocked)', async () => {
    // This will throw until ffmpeg logic is implemented
    await expect(
      main([createMockFile('a.mp4'), createMockFile('b.mp4')], {})
    ).rejects.toThrow('Video merging not yet implemented.');
  });
});
