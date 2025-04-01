import { describe, it, expect, vi } from 'vitest';
import { compressPdf } from './service';
import { CompressionLevel } from './types';

// Mock the mupdf module
vi.mock('mupdf', () => {
  return {
    Document: {
      openDocument: vi.fn(() => ({
        countPages: vi.fn(() => 2),
        loadPage: vi.fn(() => ({}))
      }))
    },
    PDFWriter: vi.fn(() => ({
      addPage: vi.fn(),
      asBuffer: vi.fn(() => Buffer.from('test'))
    }))
  };
});

// Mock the pdf-lib module
vi.mock('pdf-lib', () => {
  return {
    PDFDocument: {
      load: vi.fn(() => ({
        getPageCount: vi.fn(() => 2)
      }))
    }
  };
});

describe('compressPdf', () => {
  it('should compress a PDF file with low compression', async () => {
    // Create a mock File
    const mockFile = new File(['test'], 'test.pdf', {
      type: 'application/pdf'
    });

    // Mock arrayBuffer method
    mockFile.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(4));

    // Call the function with low compression
    const result = await compressPdf(mockFile, {
      compressionLevel: 'low' as CompressionLevel
    });

    // Check the result
    expect(result).toBeInstanceOf(File);
    expect(result.name).toBe('test-compressed.pdf');
    expect(result.type).toBe('application/pdf');
  });

  it('should compress a PDF file with medium compression', async () => {
    // Create a mock File
    const mockFile = new File(['test'], 'test.pdf', {
      type: 'application/pdf'
    });

    // Mock arrayBuffer method
    mockFile.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(4));

    // Call the function with medium compression
    const result = await compressPdf(mockFile, {
      compressionLevel: 'medium' as CompressionLevel
    });

    // Check the result
    expect(result).toBeInstanceOf(File);
    expect(result.name).toBe('test-compressed.pdf');
    expect(result.type).toBe('application/pdf');
  });

  it('should compress a PDF file with high compression', async () => {
    // Create a mock File
    const mockFile = new File(['test'], 'test.pdf', {
      type: 'application/pdf'
    });

    // Mock arrayBuffer method
    mockFile.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(4));

    // Call the function with high compression
    const result = await compressPdf(mockFile, {
      compressionLevel: 'high' as CompressionLevel
    });

    // Check the result
    expect(result).toBeInstanceOf(File);
    expect(result.name).toBe('test-compressed.pdf');
    expect(result.type).toBe('application/pdf');
  });

  it('should handle errors during compression', async () => {
    // Create a mock File
    const mockFile = new File(['test'], 'test.pdf', {
      type: 'application/pdf'
    });

    // Mock arrayBuffer method to throw an error
    mockFile.arrayBuffer = vi.fn().mockRejectedValue(new Error('Test error'));

    // Check that the function throws an error
    await expect(
      compressPdf(mockFile, { compressionLevel: 'medium' as CompressionLevel })
    ).rejects.toThrow('Failed to compress PDF: Test error');
  });
});
