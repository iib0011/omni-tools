import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  name: 'Split',
  path: 'split',
  icon: 'material-symbols-light:call-split',
  description:
    "World's simplest browser-based utility for splitting text. Input your text and specify a separator to split it into multiple parts. Perfect for data processing, text manipulation, or extracting specific content from larger text blocks.",
  shortDescription: 'Split text into multiple parts using a separator',
  keywords: ['split'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string.split.name',
    description: 'string.split.description',
    shortDescription: 'string.split.shortDescription'
  }
});
