import { expect, describe, it, vi, beforeEach } from 'vitest';
import { convertPdfToWord } from './service';

// 1. Global Mock for pdfjs-dist:
// We define getDocument as a simple mock function here.
// Its specific implementation will be set in beforeEach or individual tests.
vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: {
    workerSrc: ''
  },
  // Ensure getDocument is a vi.fn() from the start
  getDocument: vi.fn()
}));

// 2. Global Mock for docx: (This part was already correct)
vi.mock('docx', () => ({
  Document: vi.fn((options) => ({ options })),
  Packer: {
    toBlob: vi.fn(() =>
      Promise.resolve(
        new Blob(['mock docx content'], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        })
      )
    )
  },
  Paragraph: vi.fn((options) => ({ type: 'Paragraph', options })),
  TextRun: vi.fn((options) => ({ type: 'TextRun', options })),
  AlignmentType: {
    LEFT: 'left',
    CENTER: 'center',
    RIGHT: 'right',
    JUSTIFIED: 'justified'
  }
}));

describe('convertPdfToWord', () => {
  // Get a reference to the mocked getDocument function from pdfjs-dist
  // We need to import it here after it's mocked globally.
  let mockedGetDocument: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks(); // Clears call history and resets implementations

    // Dynamically import pdfjsLib to get the mocked getDocument reference
    // This ensures we get the *mocked* version, not the original.
    const pdfjsLib = await import('pdfjs-dist');
    mockedGetDocument = pdfjsLib.getDocument as ReturnType<typeof vi.fn>;

    // Set a default mock implementation for getDocument that can be overridden
    // This default is what the first test expects.
    mockedGetDocument.mockImplementation(() => ({
      promise: Promise.resolve({
        numPages: 1,
        getPage: vi.fn((pageNum) => {
          if (pageNum === 1) {
            return {
              getTextContent: vi.fn(() =>
                Promise.resolve({
                  items: [
                    {
                      str: 'Hello',
                      dir: 'ltr',
                      width: 20,
                      height: 10,
                      transform: [1, 0, 0, 1, 100, 700],
                      fontName: 'g_d0_f1'
                    },
                    {
                      str: 'World!',
                      dir: 'ltr',
                      width: 25,
                      height: 10,
                      transform: [1, 0, 0, 1, 125, 700],
                      fontName: 'g_d0_f1'
                    },
                    {
                      str: 'This is a',
                      dir: 'ltr',
                      width: 40,
                      height: 10,
                      transform: [1, 0, 0, 1, 100, 680],
                      fontName: 'g_d0_f1'
                    },
                    {
                      str: 'test.',
                      dir: 'ltr',
                      width: 20,
                      height: 10,
                      transform: [1, 0, 0, 1, 145, 680],
                      fontName: 'g_d0_f1'
                    },
                    {
                      str: 'New paragraph.',
                      dir: 'ltr',
                      width: 60,
                      height: 12,
                      transform: [1, 0, 0, 1, 80, 600],
                      fontName: 'g_d0_f2_bold'
                    },
                    {
                      str: 'Right aligned text.',
                      dir: 'ltr',
                      width: 80,
                      height: 10,
                      transform: [1, 0, 0, 1, 550, 580],
                      fontName: 'g_d0_f1'
                    }, // X-coord adjusted for right alignment
                    {
                      str: 'Center.',
                      dir: 'ltr',
                      width: 30,
                      height: 10,
                      transform: [1, 0, 0, 1, 280, 560],
                      fontName: 'g_d0_f1'
                    }
                  ],
                  lastItem: null
                })
              ),
              getViewport: vi.fn(() => ({
                width: 595,
                height: 842,
                scale: 1
              }))
            };
          }
          return null;
        })
      })
    }));
  });

  // Test case: Basic conversion of a single PDF page with various text elements
  it('should convert a single PDF page to a Word document with inferred paragraphs and formatting', async () => {
    const mockFile = new File(['mock pdf content'], 'document.pdf', {
      type: 'application/pdf'
    });

    const resultFile = await convertPdfToWord(mockFile);

    expect(resultFile).toBeInstanceOf(File);
    expect(resultFile.name).toBe('document.docx');
    expect(resultFile.type).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );

    const { Packer } = await import('docx');
    expect(Packer.toBlob).toHaveBeenCalledTimes(1);

    const { Document } = await import('docx');
    expect(Document).toHaveBeenCalledTimes(1);
    const docConstructorArgs = (Document as any).mock.calls[0][0];

    expect(docConstructorArgs).toHaveProperty('sections');
    expect(docConstructorArgs.sections[0]).toHaveProperty('children');

    const paragraphs = docConstructorArgs.sections[0].children;

    // Expected paragraphs:
    // 1. "Hello World!"
    // 2. "This is a test."
    // 3. "New paragraph."
    // 4. "Right aligned text."
    // 5. "Center."
    // 6. An empty paragraph for page spacing
    expect(paragraphs.length).toBe(6);

    // Paragraph 1: "Hello World!"
    expect(
      paragraphs[0].options.children.map((c: any) => c.options.text).join('')
    ).toBe('Hello World!');
    expect(paragraphs[0].options.alignment).toBe('left');
    expect(paragraphs[0].options.children[0].options.bold).toBe(false);

    // Paragraph 2: "This is a test."
    expect(
      paragraphs[1].options.children.map((c: any) => c.options.text).join('')
    ).toBe('This is a test.');
    expect(paragraphs[1].options.alignment).toBe('left');

    // Paragraph 3: "New paragraph." (bold, larger font)
    expect(
      paragraphs[2].options.children.map((c: any) => c.options.text).join('')
    ).toBe('New paragraph.');
    expect(paragraphs[2].options.children[0].options.bold).toBe(true);
    expect(paragraphs[2].options.children[0].options.size).toBe(24); // 12 * 2 half-points

    // Paragraph 4: "Right aligned text."
    expect(
      paragraphs[3].options.children.map((c: any) => c.options.text).join('')
    ).toBe('Right aligned text.');
    expect(paragraphs[3].options.alignment).toBe('right'); // This should now pass

    // Paragraph 5: "Center."
    expect(
      paragraphs[4].options.children.map((c: any) => c.options.text).join('')
    ).toBe('Center.');
    expect(paragraphs[4].options.alignment).toBe('center');

    // Paragraph 6: Page separator
    expect(paragraphs[5].options.text).toBe('');
    expect(paragraphs[5].options.spacing.after).toBe(400);
  });

  // Test case: Handling an empty PDF page
  it('should add a "[No text on this page]" paragraph for an empty PDF page', async () => {
    // Arrange: Override the default mock implementation for this specific test
    mockedGetDocument.mockImplementationOnce(() => ({
      promise: Promise.resolve({
        numPages: 1,
        getPage: vi.fn(() => ({
          getTextContent: vi.fn(() =>
            Promise.resolve({ items: [], lastItem: null })
          ),
          getViewport: vi.fn(() => ({ width: 595, height: 842, scale: 1 }))
        }))
      })
    }));

    const mockFile = new File(['empty pdf'], 'empty.pdf', {
      type: 'application/pdf'
    });

    // Act
    await convertPdfToWord(mockFile);

    // Assert
    const { Document } = await import('docx');
    const docConstructorArgs = (Document as any).mock.calls[0][0];
    const paragraphs = docConstructorArgs.sections[0].children;

    expect(paragraphs.length).toBe(2); // Should now pass
    expect(paragraphs[0].options.children[0].options.text).toBe(
      '[No text on this page]'
    );
    expect(paragraphs[0].options.children[0].options.italics).toBe(true);
    expect(paragraphs[1].options.text).toBe('');
  });

  // Test case: PDF with multiple pages
  it('should process multiple pages correctly', async () => {
    // Arrange: Override the default mock implementation for this specific test
    mockedGetDocument.mockImplementationOnce(() => ({
      promise: Promise.resolve({
        numPages: 2,
        getPage: vi.fn((pageNum) => {
          if (pageNum === 1) {
            return {
              getTextContent: vi.fn(() =>
                Promise.resolve({
                  items: [
                    {
                      str: 'Page 1 content',
                      dir: 'ltr',
                      width: 50,
                      height: 10,
                      transform: [1, 0, 0, 1, 100, 700],
                      fontName: 'f1'
                    }
                  ],
                  lastItem: null
                })
              ),
              getViewport: vi.fn(() => ({ width: 595, height: 842, scale: 1 }))
            };
          } else if (pageNum === 2) {
            return {
              getTextContent: vi.fn(() =>
                Promise.resolve({
                  items: [
                    {
                      str: 'Page 2 content',
                      dir: 'ltr',
                      width: 50,
                      height: 10,
                      transform: [1, 0, 0, 1, 100, 700],
                      fontName: 'f1'
                    }
                  ],
                  lastItem: null
                })
              ),
              getViewport: vi.fn(() => ({ width: 595, height: 842, scale: 1 }))
            };
          }
          return null;
        })
      })
    }));

    const mockFile = new File(['multi-page pdf'], 'multi-page.pdf', {
      type: 'application/pdf'
    });

    // Act
    await convertPdfToWord(mockFile);

    // Assert
    const { Document } = await import('docx');
    const docConstructorArgs = (Document as any).mock.calls[0][0];
    const paragraphs = docConstructorArgs.sections[0].children;

    expect(paragraphs.length).toBe(4); // Should now pass
    expect(paragraphs[0].options.children[0].options.text).toBe(
      'Page 1 content'
    );
    expect(paragraphs[1].options.text).toBe('');
    expect(paragraphs[2].options.children[0].options.text).toBe(
      'Page 2 content'
    );
    expect(paragraphs[3].options.text).toBe('');
  });
});
