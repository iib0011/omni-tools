import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('list', {
  name: 'Truncate',
  path: 'truncate',
  icon: 'mdi:format-horizontal-align-right',
  description:
    "World's simplest browser-based utility for truncating lists. Quickly limit the number of items in your list by specifying a maximum length. Perfect for sampling data, creating previews, or managing large lists. Supports custom separators and various truncation options.",
  shortDescription: 'Limit the number of items in a list',
  keywords: ['truncate'],
  component: lazy(() => import('./index'))
});
