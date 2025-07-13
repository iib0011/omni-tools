import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('list', {
  name: 'Truncate',
  path: 'truncate',
  icon: 'material-symbols-light:content-cut',
  description:
    "World's simplest browser-based utility for truncating lists. Input your list and specify the maximum number of items to keep. Perfect for data processing, list management, or limiting content length.",
  shortDescription: 'Truncate list to specified number of items',
  keywords: ['truncate'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'list:truncate.title',
    description: 'list:truncate.description',
    shortDescription: 'list:truncate.shortDescription'
  }
});
