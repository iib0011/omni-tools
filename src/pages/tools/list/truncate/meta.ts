import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('list', {
  name: 'Truncate list',
  path: 'truncate',
  shortDescription: 'Truncate a list to a specified number of items',
  icon: 'material-symbols-light:short-text',
  description:
    'Truncate a list to keep only the first N items or remove items beyond a certain limit.',
  keywords: ['truncate', 'list', 'limit', 'cut'],
  userTypes: ['General Users', 'Students'],
  component: lazy(() => import('./index'))
});
