import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  name: 'Extract substring',
  path: 'extract-substring',
  icon: 'material-symbols-light:content-cut',
  description:
    "World's simplest browser-based utility for extracting substrings from text. Easily extract specific portions of text by specifying start position and length. Perfect for parsing data, isolating specific parts of text, or data extraction tasks. Supports multi-line text processing and character-level precision.",
  shortDescription: 'Extract specific portions of text by position and length',
  keywords: ['extract', 'substring'],
  component: lazy(() => import('./index'))
});
