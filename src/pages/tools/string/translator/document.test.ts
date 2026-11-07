import { describe, expect, it } from 'vitest';
import {
  DOCUMENT_EXTENSIONS,
  formatFileSize,
  getAcceptedExtensions,
  MAX_DOCUMENT_SIZE_BYTES,
  validateDocument
} from './document';
import { getTargetOptions, pickTarget } from './languages';
import { LibreLanguage, LibreServerSettings } from './types';

const settings = (formats: string[]): LibreServerSettings => ({
  charLimit: -1,
  keyRequired: false,
  filesTranslation: true,
  supportedFilesFormat: formats
});

const fileOfSize = (name: string, size: number) => {
  const file = new File(['x'], name);
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('getAcceptedExtensions', () => {
  it('uses all requested formats when the server does not report any', () => {
    expect(getAcceptedExtensions(null)).toEqual([...DOCUMENT_EXTENSIONS]);
    expect(getAcceptedExtensions(settings([]))).toEqual([
      ...DOCUMENT_EXTENSIONS
    ]);
  });

  it('narrows to the formats supported by the server', () => {
    expect(
      getAcceptedExtensions(settings(['.txt', '.PDF', '.xyz', 'docx']))
    ).toEqual(['txt', 'docx', 'pdf']);
  });
});

describe('validateDocument', () => {
  const accepted = ['txt', 'pdf'];

  it('accepts supported files regardless of extension case', () => {
    expect(() =>
      validateDocument(fileOfSize('REPORT.PDF', 1000), accepted)
    ).not.toThrow();
  });

  it.each(['photo.png', 'archive.tar.gz', 'noextension'])(
    'rejects unsupported file %s',
    (name) => {
      expect(() => validateDocument(fileOfSize(name, 10), accepted)).toThrow(
        expect.objectContaining({ code: 'unsupportedFormat' })
      );
    }
  );

  it('rejects empty files', () => {
    expect(() => validateDocument(fileOfSize('a.txt', 0), accepted)).toThrow(
      expect.objectContaining({ code: 'emptyFile' })
    );
  });

  it('rejects oversized files', () => {
    expect(() =>
      validateDocument(
        fileOfSize('a.pdf', MAX_DOCUMENT_SIZE_BYTES + 1),
        accepted
      )
    ).toThrow(expect.objectContaining({ code: 'fileTooLarge' }));
    expect(() =>
      validateDocument(fileOfSize('a.pdf', MAX_DOCUMENT_SIZE_BYTES), accepted)
    ).not.toThrow();
  });
});

describe('formatFileSize', () => {
  it.each([
    [512, '512 B'],
    [1536, '1.5 KB'],
    [20 * 1024 * 1024, '20 MB']
  ])('%i → %s', (bytes, expected) => {
    expect(formatFileSize(bytes)).toBe(expected);
  });
});

describe('language helpers', () => {
  const languages: LibreLanguage[] = [
    { code: 'en', name: 'English', targets: ['es', 'fr'] },
    { code: 'es', name: 'Spanish', targets: ['en'] },
    { code: 'fr', name: 'French' },
    { code: 'pt-BR', name: 'Portuguese (Brazil)', targets: ['en'] }
  ];

  it('offers every language as target for auto-detection', () => {
    expect(getTargetOptions(languages, 'auto')).toBe(languages);
  });

  it('uses the server targets list for a fixed source', () => {
    expect(getTargetOptions(languages, 'en').map((l) => l.code)).toEqual([
      'es',
      'fr'
    ]);
  });

  it('falls back to all other languages when targets are unknown', () => {
    expect(getTargetOptions(languages, 'fr').map((l) => l.code)).toEqual([
      'en',
      'es',
      'pt-BR'
    ]);
  });

  it('keeps a valid current target', () => {
    expect(pickTarget(languages, 'es', 'fr')).toBe('es');
  });

  it('prefers the UI language, then English, then the first option', () => {
    expect(pickTarget(languages, '', 'fr')).toBe('fr');
    expect(pickTarget(languages, '', 'pt')).toBe('pt-BR');
    expect(pickTarget(languages, '', 'ja')).toBe('en');
    expect(pickTarget(languages.slice(1), 'xx', 'ja')).toBe('es');
    expect(pickTarget([], 'xx', 'en')).toBe('');
  });
});
