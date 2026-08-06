import { marked } from 'marked';
import { MarkdownAnalysis } from './types';

const AUTO_RENDER_CHAR_LIMIT = 100_000;
const AUTO_RENDER_LINE_LIMIT = 1_800;
const MAX_RENDER_CHAR_LIMIT = 500_000;
const MAX_RENDER_LINE_LIMIT = 9_000;
const CHUNK_TARGET_CHAR_COUNT = 32_000;
const CHUNK_MIN_CHAR_COUNT = 12_000;

marked.setOptions({
  gfm: true,
  breaks: false
});

export function normalizeMarkdownInput(markdown: string): string {
  return markdown.replace(/^\uFEFF/u, '').replace(/\r\n/g, '\n');
}

export function extractDocumentTitle(markdown: string): string | null {
  const tokens = marked.lexer(normalizeMarkdownInput(markdown));
  const firstHeading = tokens.find((token) => token.type === 'heading');

  return firstHeading && 'text' in firstHeading
    ? firstHeading.text.trim() || null
    : null;
}

export function getMarkdownPdfBaseName(
  sourceName?: string | null,
  markdown?: string
): string {
  const sourceBase = sourceName?.replace(/\.[^.]+$/u, '').trim();
  const title = extractDocumentTitle(markdown ?? '');
  const rawName = title || sourceBase || 'markdown-document';

  return (
    rawName
      .toLowerCase()
      .replace(/[^a-z0-9]+/giu, '-')
      .replace(/^-+|-+$/gu, '')
      .slice(0, 80) || 'markdown-document'
  );
}

export function analyzeMarkdownComplexity(markdown: string): MarkdownAnalysis {
  const normalized = normalizeMarkdownInput(markdown);
  const charCount = normalized.length;
  const lineCount = normalized.length === 0 ? 0 : normalized.split('\n').length;
  const headingCount = (normalized.match(/^#{1,6}\s+/gm) ?? []).length;
  const codeBlockCount = (normalized.match(/^```/gm) ?? []).length / 2;
  const estimatedPages = Math.max(
    1,
    Math.ceil(
      charCount / 2_600 +
        headingCount / 4 +
        codeBlockCount / 2 +
        lineCount / 120
    )
  );
  const estimatedChunkCount = Math.max(
    1,
    Math.ceil(charCount / CHUNK_TARGET_CHAR_COUNT)
  );

  return {
    charCount,
    lineCount,
    headingCount,
    codeBlockCount,
    estimatedPages,
    estimatedChunkCount,
    requiresManualGeneration:
      charCount > AUTO_RENDER_CHAR_LIMIT ||
      lineCount > AUTO_RENDER_LINE_LIMIT ||
      codeBlockCount > 24,
    exceedsSupportedSize:
      charCount > MAX_RENDER_CHAR_LIMIT || lineCount > MAX_RENDER_LINE_LIMIT
  };
}

export function splitMarkdownIntoChunks(
  markdown: string,
  maxCharsPerChunk = CHUNK_TARGET_CHAR_COUNT,
  minCharsPerChunk = CHUNK_MIN_CHAR_COUNT
): string[] {
  const normalized = normalizeMarkdownInput(markdown);
  if (normalized.length <= maxCharsPerChunk) {
    return [normalized];
  }

  const lines = normalized.split('\n');
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentLength = 0;
  let insideFence = false;

  const flushChunk = () => {
    const value = currentChunk.join('\n').trim();
    if (value) {
      chunks.push(value);
    }
    currentChunk = [];
    currentLength = 0;
  };

  const appendLine = (line: string) => {
    currentChunk.push(line);
    currentLength += line.length + 1;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    const isFence = /^(```|~~~)/u.test(trimmed);
    const isHeading = !insideFence && /^#{1,6}\s+/u.test(trimmed);
    const isSoftBoundary = !insideFence && trimmed === '';
    const wouldOverflow = currentLength + line.length + 1 > maxCharsPerChunk;
    const canSplitBeforeLine =
      currentLength >= minCharsPerChunk && (isHeading || isSoftBoundary);

    if (wouldOverflow && canSplitBeforeLine) {
      flushChunk();
    } else if (
      wouldOverflow &&
      !insideFence &&
      currentLength >= minCharsPerChunk
    ) {
      flushChunk();
    }

    appendLine(line);

    if (isFence) {
      insideFence = !insideFence;
    }
  }

  flushChunk();
  return chunks.length > 0 ? chunks : [normalized];
}
