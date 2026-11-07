import JSZip from 'jszip';
import mime from 'mime';
import { getFileExtension } from '@utils/file';
import { TranslatorError } from '../errors';
import {
  extractHtmlText,
  extractParagraphs,
  ParagraphDocument,
  ParagraphRules
} from './markup';

/** A document split into translatable segments. */
export interface ParsedDocument {
  segments: string[];
  /** Rebuilds the document with `translations[i]` replacing `segments[i]`. */
  build: (translations: string[]) => Promise<Blob>;
}

type Parser = (file: File) => Promise<ParsedDocument>;

const mimeFor = (extension: string) =>
  mime.getType(extension) ?? 'application/octet-stream';

/** Combines several parts into one segment list and splits results back. */
function combine(parts: ParagraphDocument[]): {
  segments: string[];
  applyAll: (translations: string[]) => string[];
} {
  return {
    segments: parts.flatMap((part) => part.segments),
    applyAll: (translations) => {
      let offset = 0;
      return parts.map((part) => {
        const slice = translations.slice(offset, offset + part.segments.length);
        offset += part.segments.length;
        return part.apply(slice);
      });
    }
  };
}

// ---------------------------------------------------------------------------
// Plain text formats
// ---------------------------------------------------------------------------

/** One segment per non-empty line; line endings and blank lines are kept. */
const parseTxt: Parser = async (file) => {
  const pieces = (await file.text()).split(/(\r?\n)/);
  const indexes = pieces
    .map((piece, i) => (i % 2 === 0 && piece.trim() ? i : -1))
    .filter((i) => i !== -1);
  return {
    segments: indexes.map((i) => pieces[i]),
    build: async (translations) => {
      const output = [...pieces];
      indexes.forEach(
        (pieceIndex, i) => (output[pieceIndex] = translations[i])
      );
      return new Blob([output.join('')], { type: 'text/plain;charset=utf-8' });
    }
  };
};

/**
 * SubRip subtitles: cue numbers and timings are kept; the text lines of each
 * cue are translated together as one segment.
 */
const parseSrt: Parser = async (file) => {
  // Strip a UTF-8 byte order mark, common in subtitle files.
  const text = (await file.text()).replace(/^\uFEFF/, '');
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const lines = text.split(/\r?\n/);
  type Block =
    | { kind: 'keep'; line: string }
    | { kind: 'text'; lines: string[] };
  const blocks: Block[] = [];

  lines.forEach((line, i) => {
    const isTiming = line.includes('-->');
    const isIndex = /^\s*\d+\s*$/.test(line) && lines[i + 1]?.includes('-->');
    if (!line.trim() || isTiming || isIndex) {
      blocks.push({ kind: 'keep', line });
      return;
    }
    const last = blocks[blocks.length - 1];
    if (last?.kind === 'text') last.lines.push(line);
    else blocks.push({ kind: 'text', lines: [line] });
  });

  const textBlocks = blocks.filter(
    (block): block is Extract<Block, { kind: 'text' }> => block.kind === 'text'
  );
  return {
    segments: textBlocks.map((block) => block.lines.join('\n')),
    build: async (translations) => {
      let t = 0;
      const output = blocks.map((block) =>
        block.kind === 'keep'
          ? block.line
          : (translations[t++] ?? block.lines.join('\n')).replace(/\r?\n/g, eol)
      );
      return new Blob([output.join(eol)], { type: 'application/x-subrip' });
    }
  };
};

const parseHtml: Parser = async (file) => {
  const document = extractHtmlText(await file.text(), true);
  return {
    segments: document.segments,
    build: async (translations) =>
      new Blob([document.apply(translations)], { type: 'text/html' })
  };
};

// ---------------------------------------------------------------------------
// ZIP-based formats (Office Open XML, OpenDocument, EPUB)
// ---------------------------------------------------------------------------

async function loadZip(file: File): Promise<JSZip> {
  try {
    return await JSZip.loadAsync(await file.arrayBuffer());
  } catch {
    throw new TranslatorError('corruptDocument');
  }
}

/**
 * Translates selected XML parts of a ZIP container. Other entries (images,
 * styles, metadata) are copied unchanged; EPUB's `mimetype` stays stored.
 */
async function parseZip(
  file: File,
  isTranslatablePart: (path: string) => boolean,
  extract: (xml: string) => ParagraphDocument
): Promise<ParsedDocument> {
  const zip = await loadZip(file);
  const paths = Object.keys(zip.files)
    .filter((path) => !zip.files[path].dir && isTranslatablePart(path))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (paths.length === 0) throw new TranslatorError('corruptDocument');

  const parts = await Promise.all(
    paths.map(async (path) => extract(await zip.files[path].async('string')))
  );
  const { segments, applyAll } = combine(parts);
  const extension = getFileExtension(file.name);

  return {
    segments,
    build: async (translations) => {
      applyAll(translations).forEach((xml, i) => zip.file(paths[i], xml));
      const mimetype = zip.file('mimetype');
      if (mimetype) {
        zip.file('mimetype', await mimetype.async('string'), {
          compression: 'STORE'
        });
      }
      return zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        mimeType: mimeFor(extension)
      });
    }
  };
}

const DOCX_RULES: ParagraphRules = {
  isParagraph: (name) => name === 'w:p',
  isTextContainer: (name) => name === 'w:t',
  isSeparator: (name) => name === 'w:tab' || name === 'w:br' || name === 'w:cr',
  preserveSpace: true
};

const PPTX_RULES: ParagraphRules = {
  isParagraph: (name) => name === 'a:p',
  isTextContainer: (name) => name === 'a:t',
  isSeparator: (name) => name === 'a:br'
};

const ODF_RULES: ParagraphRules = {
  isParagraph: (name) => name === 'text:p' || name === 'text:h',
  isSkipped: (name) =>
    name === 'text:note-citation' || name === 'text:tracked-changes',
  isSeparator: (name) =>
    name === 'text:tab' || name === 'text:line-break' || name === 'text:s'
};

const PARSERS: Record<string, Parser> = {
  txt: parseTxt,
  srt: parseSrt,
  html: parseHtml,
  htm: parseHtml,
  docx: (file) =>
    parseZip(
      file,
      (path) =>
        /^word\/(document|header\d*|footer\d*|footnotes|endnotes)\.xml$/.test(
          path
        ),
      (xml) => extractParagraphs(xml, DOCX_RULES)
    ),
  pptx: (file) =>
    parseZip(
      file,
      (path) =>
        /^ppt\/(slides\/slide\d+|notesSlides\/notesSlide\d+)\.xml$/.test(path),
      (xml) => extractParagraphs(xml, PPTX_RULES)
    ),
  odt: (file) =>
    parseZip(
      file,
      (path) => path === 'content.xml',
      (xml) => extractParagraphs(xml, ODF_RULES)
    ),
  odp: (file) =>
    parseZip(
      file,
      (path) => path === 'content.xml',
      (xml) => extractParagraphs(xml, ODF_RULES)
    ),
  epub: (file) =>
    parseZip(
      file,
      (path) => /\.(xhtml|html|htm)$/i.test(path),
      (xml) => extractHtmlText(xml, false)
    )
};

export const SUPPORTED_DOCUMENT_EXTENSIONS = Object.keys(PARSERS);

export async function parseDocument(file: File): Promise<ParsedDocument> {
  const parser = PARSERS[getFileExtension(file.name)];
  if (!parser) throw new TranslatorError('unsupportedFormat');
  return parser(file);
}
