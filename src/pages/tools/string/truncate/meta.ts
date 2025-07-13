import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  name: 'Truncate',
  path: 'truncate',
  icon: 'material-symbols-light:content-cut',
  description:
    "World's simplest browser-based utility for truncating text. Input your text and specify the maximum length to cut it down. Perfect for data processing, text formatting, or limiting content length.",
  shortDescription: 'Truncate text to a specified length',
  keywords: ['truncate'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'string:truncate.title',
    description: 'string:truncate.description',
    shortDescription: 'string:truncate.shortDescription'
  }
});
