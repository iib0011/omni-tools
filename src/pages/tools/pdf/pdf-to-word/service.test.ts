import { describe, it, expect, vi, beforeEach } from 'vitest';
import { convertPdfToDOCX } from './service';
import * as pdfjsLib from 'pdfjs-dist';
import { Packer } from 'docx';

vi.mock('pdfjs-dist', () => ({
  getDocument: vi.fn(),
  GlobalWorkerOptions: { workerSrc: '' }
}));

// Mock the worker import to prevent Vite from trying to resolve it during test
vi.mock('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url', () => ({
  default: 'mock-worker-url'
}));

vi.mock('docx', () => {
  return {
    Document: vi.fn(),
    Paragraph: vi.fn(),
    TextRun: vi.fn(),
    Packer: {
      toBlob: vi
        .fn()
        .mockResolvedValue(
          new Blob(['mock docx data'], {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          })
        )
    }
  };
});

describe('convertPdfToDOCX', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  it('should process a PDF and return a docx Blob and File', async () => {
    const mockFile = new File(['%PDF-1.4'], 'test.pdf', {
      type: 'application/pdf'
    });

    const mockPage = {
      getTextContent: vi.fn().mockResolvedValue({
        items: [
          { str: 'Hello', hasEOL: true },
          { str: 'World', hasEOL: false }
        ]
      })
    };

    const mockPdfDocument = {
      numPages: 1,
      getPage: vi.fn().mockResolvedValue(mockPage)
    };

    (pdfjsLib.getDocument as any).mockReturnValue({
      promise: Promise.resolve(mockPdfDocument)
    });

    const result = await convertPdfToDOCX(mockFile);

    expect(result).toHaveProperty('docxBlob');
    expect(result).toHaveProperty('file');
    expect(result.file.name).toBe('test.docx');

    expect(pdfjsLib.getDocument).toHaveBeenCalledWith('mock-url');
    expect(mockPdfDocument.getPage).toHaveBeenCalledWith(1);
    expect(mockPage.getTextContent).toHaveBeenCalled();
    expect(Packer.toBlob).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
  });
});
