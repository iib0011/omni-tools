import { MarkdownPdfRenderOptions } from './types';

export interface MarkdownPdfRenderRequest {
  markdown: string;
  options: MarkdownPdfRenderOptions;
}
