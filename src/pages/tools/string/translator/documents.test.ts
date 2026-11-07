import { describe, expect, it } from 'vitest';
import JSZip from 'jszip';
import {
  decodeEntities,
  encodeText,
  extractHtmlText,
  extractParagraphs,
  serialize,
  tokenize
} from './documents/markup';
import { parseDocument } from './documents/formats';
import {
  buildTranslatedFileName,
  formatFileSize,
  MAX_DOCUMENT_SIZE_BYTES,
  validateDocument
} from './document';
import { TranslatorError } from './errors';

const upper = (segments: string[]) => segments.map((s) => s.toUpperCase());

async function zipFile(
  name: string,
  entries: Record<string, string | Uint8Array>
) {
  const zip = new JSZip();
  Object.entries(entries).forEach(([path, content]) => zip.file(path, content));
  const data = await zip.generateAsync({ type: 'arraybuffer' });
  return new File([data], name);
}

async function readZip(blob: Blob) {
  return JSZip.loadAsync(await blob.arrayBuffer());
}

describe('markup tokenizer', () => {
  it('round-trips documents byte for byte', () => {
    const xml =
      '<?xml version="1.0"?><!-- c --><a x="1 > 2"><b/>t &amp; u<![CDATA[<raw>]]></a>';
    expect(serialize(tokenize(xml))).toBe(xml);
    const html =
      '<!DOCTYPE html><p>a<br>b<script>if (a<b) {}</script><img src=x>c</p>';
    expect(serialize(tokenize(html, true))).toBe(html);
  });

  it('treats HTML script content as raw text', () => {
    const tokens = tokenize('<script>if (a<b) x()</script>', true);
    expect(tokens.map((t) => t.type)).toEqual(['open', 'other', 'close']);
  });

  it('decodes and encodes entities safely', () => {
    expect(
      decodeEntities('a &amp; b &lt;c&gt; &#233;&#xE9; &nbsp;&copy;')
    ).toBe('a & b <c> éé  &copy;');
    expect(encodeText('Tom & Jerry <3 &copy;')).toBe(
      'Tom &amp; Jerry &lt;3 &copy;'
    );
  });
});

describe('extractParagraphs', () => {
  const W =
    'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';

  it('joins runs of a paragraph and writes the translation into the first run', () => {
    const xml = `<w:document ${W}><w:body><w:p><w:r><w:t>Hel</w:t></w:r><w:r><w:rPr><w:b/></w:rPr><w:t>lo </w:t></w:r><w:r><w:t>world</w:t></w:r></w:p><w:p/></w:body></w:document>`;
    const doc = extractParagraphs(xml, {
      isParagraph: (n) => n === 'w:p',
      isTextContainer: (n) => n === 'w:t',
      preserveSpace: true
    });
    expect(doc.segments).toEqual(['Hello world']);
    const out = doc.apply(['Hola mundo']);
    expect(out).toContain('<w:t xml:space="preserve">Hola mundo</w:t>');
    expect(out).toContain('<w:rPr><w:b/></w:rPr><w:t></w:t>');
    expect(out.match(/<w:p>/g)).toHaveLength(1);
  });

  it('ignores text outside text containers (e.g. field codes)', () => {
    const xml = `<w:p ${W}><w:r><w:instrText>PAGE</w:instrText></w:r><w:r><w:t>Page</w:t></w:r></w:p>`;
    const doc = extractParagraphs(xml, {
      isParagraph: (n) => n === 'w:p',
      isTextContainer: (n) => n === 'w:t'
    });
    expect(doc.segments).toEqual(['Page']);
    expect(doc.apply(['Seite'])).toContain('<w:instrText>PAGE</w:instrText>');
  });

  it('treats nested paragraphs as separate units and separators as spaces', () => {
    const xml =
      '<text:p>Outer<text:tab/>text<draw:frame><text:p>Inner</text:p></draw:frame> end</text:p>';
    const doc = extractParagraphs(xml, {
      isParagraph: (n) => n === 'text:p',
      isSeparator: (n) => n === 'text:tab'
    });
    expect(doc.segments).toEqual(['Outer text end', 'Inner']);
  });

  it('escapes translated text', () => {
    const doc = extractParagraphs('<p>a &amp; b</p>', {
      isParagraph: (n) => n === 'p'
    });
    expect(doc.segments).toEqual(['a & b']);
    expect(doc.apply(['<x> & y'])).toBe('<p>&lt;x&gt; &amp; y</p>');
  });
});

describe('extractHtmlText', () => {
  it('extracts visible text only and keeps markup', () => {
    const html = `<!DOCTYPE html><html><head><title>Hi</title><style>p{}</style><script>var a = "x";</script></head><body><p>Hello <b>bold</b> <a href="/x">link</a></p><code>keep()</code><!-- note --></body></html>`;
    const doc = extractHtmlText(html);
    expect(doc.segments).toEqual(['Hi', 'Hello ', 'bold', 'link']);
    const out = doc.apply(upper(doc.segments));
    expect(out).toBe(
      html
        .replace('>Hi<', '>HI<')
        .replace('Hello <b>bold', 'HELLO <b>BOLD')
        .replace('>link<', '>LINK<')
    );
  });
});

describe('document formats', () => {
  const translateWith = async (file: File, fn = upper) => {
    const parsed = await parseDocument(file);
    return { parsed, blob: await parsed.build(fn(parsed.segments)) };
  };

  it('TXT: translates lines, keeps blank lines and line endings', async () => {
    const { parsed, blob } = await translateWith(
      new File(['Hello\r\n\r\n  World\r\n'], 'a.txt')
    );
    expect(parsed.segments).toEqual(['Hello', '  World']);
    expect(await blob.text()).toBe('HELLO\r\n\r\n  WORLD\r\n');
  });

  it('SRT: keeps cue numbers and timings, translates cue text', async () => {
    const srt =
      '1\n00:00:01,000 --> 00:00:02,000\nHello there\nfriend\n\n2\n00:00:03,000 --> 00:00:04,000\nBye\n';
    const { parsed, blob } = await translateWith(new File([srt], 'a.srt'));
    expect(parsed.segments).toEqual(['Hello there\nfriend', 'Bye']);
    expect(await blob.text()).toBe(
      '1\n00:00:01,000 --> 00:00:02,000\nHELLO THERE\nFRIEND\n\n2\n00:00:03,000 --> 00:00:04,000\nBYE\n'
    );
  });

  it('SRT: handles a byte order mark and keeps literal "FEFF" text', async () => {
    const srt = '\uFEFF1\n00:00:01,000 --> 00:00:02,000\nFEFF code\n';
    const { parsed, blob } = await translateWith(new File([srt], 'a.srt'));
    expect(parsed.segments).toEqual(['FEFF code']);
    expect(await blob.text()).toBe(
      '1\n00:00:01,000 --> 00:00:02,000\nFEFF CODE\n'
    );
  });

  it('HTML: translates text nodes', async () => {
    const { blob } = await translateWith(
      new File(['<p>Hi <em>you</em></p>'], 'a.html')
    );
    expect(await blob.text()).toBe('<p>HI <em>YOU</em></p>');
    expect(blob.type).toBe('text/html');
  });

  it('DOCX: translates body, headers and footnotes; keeps other parts', async () => {
    const W =
      'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
    const image = new Uint8Array([137, 80, 78, 71, 1, 2, 3]);
    const file = await zipFile('report.docx', {
      '[Content_Types].xml': '<Types/>',
      'word/document.xml': `<w:document ${W}><w:body><w:p><w:r><w:t>Hello</w:t></w:r></w:p><w:tbl><w:tr><w:tc><w:p><w:r><w:t>Cell</w:t></w:r></w:p></w:tc></w:tr></w:tbl></w:body></w:document>`,
      'word/header1.xml': `<w:hdr ${W}><w:p><w:r><w:t>Header</w:t></w:r></w:p></w:hdr>`,
      'word/styles.xml': `<w:styles ${W}><w:style><w:name w:val="Title"/></w:style></w:styles>`,
      'word/media/image1.png': image
    });
    const { parsed, blob } = await translateWith(file);
    expect(parsed.segments).toEqual(['Hello', 'Cell', 'Header']);

    const zip = await readZip(blob);
    expect(await zip.file('word/document.xml')?.async('string')).toContain(
      '<w:t xml:space="preserve">HELLO</w:t>'
    );
    expect(await zip.file('word/document.xml')?.async('string')).toContain(
      'CELL'
    );
    expect(await zip.file('word/header1.xml')?.async('string')).toContain(
      'HEADER'
    );
    expect(await zip.file('word/styles.xml')?.async('string')).toContain(
      'Title'
    );
    expect(
      await zip.file('word/media/image1.png')?.async('uint8array')
    ).toEqual(image);
    expect(blob.type).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
  });

  it('PPTX: translates slides in order and speaker notes', async () => {
    const A = 'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"';
    const slide = (text: string) =>
      `<p:sld ${A}><a:p><a:r><a:t>${text}</a:t></a:r><a:br/><a:r><a:t>more</a:t></a:r></a:p></p:sld>`;
    const file = await zipFile('deck.pptx', {
      'ppt/slides/slide10.xml': slide('Ten'),
      'ppt/slides/slide2.xml': slide('Two'),
      'ppt/notesSlides/notesSlide1.xml': slide('Note')
    });
    const { parsed, blob } = await translateWith(file);
    expect(parsed.segments).toEqual(['Note more', 'Two more', 'Ten more']);
    const zip = await readZip(blob);
    expect(await zip.file('ppt/slides/slide2.xml')?.async('string')).toContain(
      '<a:t>TWO MORE</a:t>'
    );
  });

  it('ODT: translates paragraphs and headings, skips note citations', async () => {
    const file = await zipFile('a.odt', {
      mimetype: 'application/vnd.oasis.opendocument.text',
      'content.xml':
        '<office:document-content><text:h>Title</text:h><text:p>Some <text:span>styled</text:span> text<text:note><text:note-citation>1</text:note-citation><text:note-body><text:p>Note</text:p></text:note-body></text:note></text:p></office:document-content>'
    });
    const { parsed, blob } = await translateWith(file);
    expect(parsed.segments).toEqual(['Title', 'Some styled text', 'Note']);
    const content = await (await readZip(blob))
      .file('content.xml')
      ?.async('string');
    expect(content).toContain('<text:h>TITLE</text:h>');
    expect(content).toContain('<text:note-citation>1</text:note-citation>');
  });

  it('EPUB: translates XHTML chapters and keeps mimetype stored first', async () => {
    const file = await zipFile('book.epub', {
      mimetype: 'application/epub+zip',
      'OEBPS/content.opf': '<package><metadata>Title</metadata></package>',
      'OEBPS/ch1.xhtml':
        '<?xml version="1.0"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>Ch 1</title></head><body><p>Once upon<br/>a time</p></body></html>'
    });
    const { parsed, blob } = await translateWith(file);
    expect(parsed.segments).toEqual(['Ch 1', 'Once upon', 'a time']);
    const zip = await readZip(blob);
    expect(Object.keys(zip.files)[0]).toBe('mimetype');
    expect(await zip.file('OEBPS/content.opf')?.async('string')).toContain(
      '<metadata>Title</metadata>'
    );
    expect(await zip.file('OEBPS/ch1.xhtml')?.async('string')).toContain(
      '<p>ONCE UPON<br/>A TIME</p>'
    );
  });

  it('rejects corrupt or incomplete ZIP documents', async () => {
    await expect(
      parseDocument(new File(['not a zip'], 'a.docx'))
    ).rejects.toMatchObject({ code: 'corruptDocument' });
    await expect(
      parseDocument(await zipFile('a.docx', { 'other.xml': '<x/>' }))
    ).rejects.toMatchObject({ code: 'corruptDocument' });
  });

  it('rejects unsupported formats', async () => {
    await expect(
      parseDocument(new File(['%PDF'], 'a.pdf'))
    ).rejects.toMatchObject({ code: 'unsupportedFormat' });
  });
});

describe('validateDocument', () => {
  const sized = (name: string, size: number) => {
    const file = new File(['x'], name);
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };

  it('accepts supported files regardless of extension case', () => {
    expect(() => validateDocument(sized('REPORT.DOCX', 10))).not.toThrow();
    expect(() => validateDocument(sized('page.htm', 10))).not.toThrow();
  });

  it.each(['a.pdf', 'a.png', 'noext'])('rejects %s', (name) => {
    expect(() => validateDocument(sized(name, 10))).toThrow(TranslatorError);
  });

  it('rejects empty and oversized files', () => {
    expect(() => validateDocument(sized('a.txt', 0))).toThrow(
      expect.objectContaining({ code: 'emptyFile' })
    );
    expect(() =>
      validateDocument(sized('a.txt', MAX_DOCUMENT_SIZE_BYTES + 1))
    ).toThrow(expect.objectContaining({ code: 'fileTooLarge' }));
  });
});

describe('file helpers', () => {
  it.each([
    ['report.docx', 'es', 'report.es.docx'],
    ['my.notes.v2.srt', 'fr', 'my.notes.v2.fr.srt'],
    ['README', 'de', 'README.de']
  ])('%s → %s', (name, target, expected) => {
    expect(buildTranslatedFileName(name, target)).toBe(expected);
  });

  it.each([
    [512, '512 B'],
    [1536, '1.5 KB'],
    [20 * 1024 * 1024, '20 MB']
  ])('formats %i as %s', (bytes, expected) => {
    expect(formatFileSize(bytes)).toBe(expected);
  });
});
