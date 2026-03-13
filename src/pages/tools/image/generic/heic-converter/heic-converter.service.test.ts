import { expect, describe, it } from 'vitest';
import { isHeicFile, formatFileSize } from './service';

// Mock File constructor
const createMockFile = (name: string, type: string): File => {
  return new File(['mock content'], name, { type });
};

describe('HEIC Converter Service', () => {
  describe('isHeicFile', () => {
    it('should return true for HEIC files', () => {
      const heicFile = createMockFile('test.heic', 'image/heic');
      expect(isHeicFile(heicFile)).toBe(true);
    });

    it('should return true for HEIF files', () => {
      const heifFile = createMockFile('test.heif', 'image/heif');
      expect(isHeicFile(heifFile)).toBe(true);
    });

    it('should return true for files with .heic extension', () => {
      const heicFile = createMockFile('test.heic', 'application/octet-stream');
      expect(isHeicFile(heicFile)).toBe(true);
    });

    it('should return true for files with .heif extension', () => {
      const heifFile = createMockFile('test.heif', 'application/octet-stream');
      expect(isHeicFile(heifFile)).toBe(true);
    });

    it('should return false for non-HEIC files', () => {
      const jpgFile = createMockFile('test.jpg', 'image/jpeg');
      const pngFile = createMockFile('test.png', 'image/png');

      expect(isHeicFile(jpgFile)).toBe(false);
      expect(isHeicFile(pngFile)).toBe(false);
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should handle decimal values', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1572864)).toBe('1.5 MB');
    });

    it('should handle large file sizes', () => {
      expect(formatFileSize(2147483648)).toBe('2 GB');
    });
  });
});
