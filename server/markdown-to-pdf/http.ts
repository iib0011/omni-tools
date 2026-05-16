import { IncomingMessage, ServerResponse } from 'http';
import { normalizeMarkdownInput } from '../../src/pages/tools/pdf/markdown-to-pdf/analysis';
import { MarkdownPdfRenderRequest } from '../../src/pages/tools/pdf/markdown-to-pdf/shared';
import { renderMarkdownPdfBuffer } from './renderMarkdownPdf';

async function readJsonBody<T>(request: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString('utf8');
  return JSON.parse(rawBody) as T;
}

export async function handleMarkdownPdfRequest(
  request: IncomingMessage,
  response: ServerResponse
): Promise<boolean> {
  if (
    request.method !== 'POST' ||
    request.url?.split('?')[0] !== '/api/pdf/markdown-to-pdf'
  ) {
    return false;
  }

  try {
    const payload = await readJsonBody<MarkdownPdfRenderRequest>(request);
    const normalized = normalizeMarkdownInput(payload.markdown);
    const { buffer, outputBaseName } = await renderMarkdownPdfBuffer(
      normalized,
      payload.options
    );

    response.statusCode = 200;
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader(
      'Content-Disposition',
      `inline; filename="${outputBaseName}.pdf"`
    );
    response.end(buffer);
  } catch (error) {
    response.statusCode = 400;
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.end(
      error instanceof Error ? error.message : 'Failed to render Markdown PDF'
    );
  }

  return true;
}
