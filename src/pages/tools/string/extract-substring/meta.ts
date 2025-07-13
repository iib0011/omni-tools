import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  name: 'Extract substring',
  path: 'extract-substring',
  icon: 'material-symbols-light:content-cut',
  description:
    "World's simplest browser-based utility for extracting substrings from text. Input your text and specify start and end positions to extract the desired portion. Perfect for data processing, text analysis, or extracting specific content from larger text blocks.",
  shortDescription: 'Extract a portion of text between specified positions',
  keywords: ['extract', 'substring'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:extractSubstring.title',
    description: 'string:extractSubstring.description',
    shortDescription: 'string:extractSubstring.shortDescription'
  }
});
