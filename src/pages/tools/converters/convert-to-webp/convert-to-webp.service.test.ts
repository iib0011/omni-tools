import { describe, it, expect } from 'vitest';
// convertToWebp requires actual image files, so we test the processImage
// helper indirectly by verifying the module can be imported without error

describe('convert-to-webp service', () => {
  it('should export convertToWebp function', async () => {
    const mod = await import('./service');
    expect(typeof mod.convertToWebp).toBe('function');
  });

  it('should return null for empty file array', async () => {
    const { convertToWebp } = await import('./service');
    const result = await convertToWebp([], 80, '#ffffff');
    expect(result).toBeNull();
  });
});
