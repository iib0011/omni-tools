/*
 * Minimal, dependency-free XML/HTML tokenizer used to rewrite the text of
 * documents while leaving every other byte (tags, attributes, comments,
 * processing instructions) untouched. Content is never executed or rendered.
 */

export type TokenType = 'text' | 'open' | 'close' | 'self' | 'other';

export interface Token {
  type: TokenType;
  /** Tag name as written (lower-cased in HTML mode); empty for text/other. */
  name: string;
  raw: string;
}

const HTML_VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
]);
const HTML_RAW_TEXT_ELEMENTS = new Set(['script', 'style', 'textarea']);

/** Index of the `>` closing the tag starting at `start`, honouring quotes. */
function findTagEnd(src: string, start: number): number {
  let quote: string | null = null;
  for (let i = start + 1; i < src.length; i++) {
    const char = src[i];
    if (quote) {
      if (char === quote) quote = null;
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === '>') {
      return i;
    }
  }
  return -1;
}

export function tokenize(src: string, html = false): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const pushText = (end: number) => {
    if (end > i)
      tokens.push({ type: 'text', name: '', raw: src.slice(i, end) });
  };

  while (i < src.length) {
    const lt = src.indexOf('<', i);
    if (lt === -1) {
      pushText(src.length);
      break;
    }
    pushText(lt);
    i = lt;

    const special: [string, string][] = [
      ['<!--', '-->'],
      ['<![CDATA[', ']]>'],
      ['<?', '?>']
    ];
    const match = special.find(([open]) => src.startsWith(open, i));
    if (match) {
      const end = src.indexOf(match[1], i + match[0].length);
      const stop = end === -1 ? src.length : end + match[1].length;
      tokens.push({ type: 'other', name: '', raw: src.slice(i, stop) });
      i = stop;
      continue;
    }

    const nameMatch = /^<(\/?)([A-Za-z_][\w:.-]*)/.exec(src.slice(i, i + 256));
    if (!nameMatch && src[i + 1] !== '!') {
      // A literal "<" in text (invalid XML, possible in HTML).
      tokens.push({ type: 'text', name: '', raw: '<' });
      i += 1;
      continue;
    }
    const end = findTagEnd(src, i);
    const stop = end === -1 ? src.length : end + 1;
    const raw = src.slice(i, stop);
    i = stop;

    if (!nameMatch) {
      tokens.push({ type: 'other', name: '', raw }); // <!DOCTYPE ...>
      continue;
    }
    const name = html ? nameMatch[2].toLowerCase() : nameMatch[2];
    if (nameMatch[1]) {
      tokens.push({ type: 'close', name, raw });
    } else if (raw.endsWith('/>') || (html && HTML_VOID_ELEMENTS.has(name))) {
      tokens.push({ type: 'self', name, raw });
    } else {
      tokens.push({ type: 'open', name, raw });
      if (html && HTML_RAW_TEXT_ELEMENTS.has(name)) {
        // Raw text: everything up to the matching close tag is not markup.
        const closeIndex = src.toLowerCase().indexOf(`</${name}`, i);
        const rawEnd = closeIndex === -1 ? src.length : closeIndex;
        if (rawEnd > i) {
          tokens.push({ type: 'other', name: '', raw: src.slice(i, rawEnd) });
        }
        i = rawEnd;
      }
    }
  }
  return tokens;
}

export const serialize = (tokens: Token[]): string =>
  tokens.map((token) => token.raw).join('');

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' '
};

export function decodeEntities(text: string): string {
  return text.replace(
    /&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi,
    (entity, body: string) => {
      if (body[0] === '#') {
        const code =
          body[1] === 'x' || body[1] === 'X'
            ? parseInt(body.slice(2), 16)
            : parseInt(body.slice(1), 10);
        try {
          return String.fromCodePoint(code);
        } catch {
          return entity;
        }
      }
      // Unknown named entities (e.g. &copy; in HTML) are kept verbatim.
      return NAMED_ENTITIES[body.toLowerCase()] ?? entity;
    }
  );
}

/**
 * Escapes text for element content. Ampersands that already start an entity
 * (kept verbatim by {@link decodeEntities}) are left as they are.
 */
export function encodeText(text: string): string {
  return text
    .replace(/&(?!(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);)/gi, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ---------------------------------------------------------------------------
// Paragraph-level extraction (word processor / presentation XML)
// ---------------------------------------------------------------------------

export interface ParagraphRules {
  /** Elements that form one translatable unit, e.g. `w:p`. */
  isParagraph: (name: string) => boolean;
  /** If set, only text directly inside these elements counts, e.g. `w:t`. */
  isTextContainer?: (name: string) => boolean;
  /** Elements whose text is ignored entirely, e.g. footnote citations. */
  isSkipped?: (name: string) => boolean;
  /** Self-closing elements that separate words, e.g. tabs and line breaks. */
  isSeparator?: (name: string) => boolean;
  /** Add `xml:space="preserve"` to the container that receives the text. */
  preserveSpace?: boolean;
}

interface Paragraph {
  text: string;
  textTokens: number[];
  /** For each text token, index of its container's open tag (or -1). */
  containerTokens: number[];
}

interface Frame {
  name: string;
  tokenIndex: number;
  paragraph: Paragraph | null;
}

export interface ParagraphDocument {
  /** Plain text of each non-empty paragraph, in order. */
  segments: string[];
  /** Serializes the document with `translations[i]` for `segments[i]`. */
  apply: (translations: string[]) => string;
}

/**
 * Groups the text of each paragraph (nested paragraphs, e.g. in text boxes,
 * are separate units) so formatting runs that split sentences mid-word are
 * translated together. On apply, the paragraph's translation goes into its
 * first text node and the other text nodes are emptied: paragraph structure
 * and styles are kept, intra-paragraph formatting is simplified.
 */
export function extractParagraphs(
  xml: string,
  rules: ParagraphRules
): ParagraphDocument {
  const tokens = tokenize(xml);
  const stack: Frame[] = [];
  const paragraphs: Paragraph[] = [];

  const innermostParagraph = (): Paragraph | null => {
    for (let i = stack.length - 1; i >= 0; i--) {
      if (stack[i].paragraph) return stack[i].paragraph;
      if (rules.isSkipped?.(stack[i].name)) return null;
    }
    return null;
  };

  tokens.forEach((token, index) => {
    if (token.type === 'open') {
      const paragraph = rules.isParagraph(token.name)
        ? { text: '', textTokens: [], containerTokens: [] }
        : null;
      if (paragraph) paragraphs.push(paragraph);
      stack.push({ name: token.name, tokenIndex: index, paragraph });
    } else if (token.type === 'close') {
      const at = stack.map((frame) => frame.name).lastIndexOf(token.name);
      if (at !== -1) stack.length = at;
    } else if (token.type === 'self' && rules.isSeparator?.(token.name)) {
      const paragraph = innermostParagraph();
      if (paragraph) paragraph.text += ' ';
    } else if (token.type === 'text') {
      const paragraph = innermostParagraph();
      if (!paragraph) return;
      const top = stack[stack.length - 1];
      if (rules.isTextContainer && !rules.isTextContainer(top.name)) return;
      paragraph.text += decodeEntities(token.raw);
      paragraph.textTokens.push(index);
      paragraph.containerTokens.push(
        rules.isTextContainer ? top.tokenIndex : -1
      );
    }
  });

  const translatable = paragraphs.filter(
    (paragraph) => paragraph.textTokens.length > 0 && paragraph.text.trim()
  );

  return {
    segments: translatable.map((paragraph) => paragraph.text),
    apply: (translations) => {
      const output = tokens.map((token) => ({ ...token }));
      translatable.forEach((paragraph, i) => {
        const [first, ...rest] = paragraph.textTokens;
        output[first].raw = encodeText(translations[i] ?? paragraph.text);
        rest.forEach((tokenIndex) => (output[tokenIndex].raw = ''));
        const container = paragraph.containerTokens[0];
        if (
          rules.preserveSpace &&
          container >= 0 &&
          !/\sxml:space=/.test(output[container].raw)
        ) {
          output[container].raw = output[container].raw.replace(
            />$/,
            ' xml:space="preserve">'
          );
        }
      });
      return serialize(output);
    }
  };
}

// ---------------------------------------------------------------------------
// Text-node extraction (HTML / XHTML)
// ---------------------------------------------------------------------------

const HTML_SKIPPED = new Set([
  'script',
  'style',
  'template',
  'code',
  'kbd',
  'samp',
  'var',
  'svg',
  'math'
]);

/**
 * Extracts visible text nodes of an HTML or XHTML document (skipping
 * scripts, styles, code and `<head>` except `<title>`). Each text node is
 * one segment, so all markup, links and inline formatting are preserved.
 */
export function extractHtmlText(
  source: string,
  html = true
): ParagraphDocument {
  const tokens = tokenize(source, html);
  const stack: string[] = [];
  const textIndexes: number[] = [];

  tokens.forEach((token, index) => {
    const name = token.name.toLowerCase().replace(/^.*:/, '');
    if (token.type === 'open') {
      stack.push(name);
    } else if (token.type === 'close') {
      const at = stack.lastIndexOf(name);
      if (at !== -1) stack.length = at;
    } else if (token.type === 'text' && token.raw.trim()) {
      if (stack.some((element) => HTML_SKIPPED.has(element))) return;
      if (stack.includes('head') && !stack.includes('title')) return;
      textIndexes.push(index);
    }
  });

  return {
    segments: textIndexes.map((index) => decodeEntities(tokens[index].raw)),
    apply: (translations) => {
      const output = tokens.map((token) => ({ ...token }));
      textIndexes.forEach((tokenIndex, i) => {
        if (translations[i] !== undefined) {
          output[tokenIndex].raw = encodeText(translations[i]);
        }
      });
      return serialize(output);
    }
  };
}
