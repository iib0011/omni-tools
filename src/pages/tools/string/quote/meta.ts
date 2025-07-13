import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
// import image from '@assets/text.png';

export const tool = defineTool('string', {
  name: 'Quote',
  path: 'quote',
  icon: 'material-symbols-light:format-quote',
  description:
    "World's simplest browser-based utility for adding quotes to text. Input your text and instantly add various quote styles around it. Perfect for formatting text, creating citations, or adding emphasis to specific content.",
  shortDescription: 'Add quotes around text with various styles',
  keywords: ['quote'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:quote.title',
    description: 'string:quote.description',
    shortDescription: 'string:quote.shortDescription'
  }
});
