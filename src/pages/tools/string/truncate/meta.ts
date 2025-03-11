import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  name: 'Truncate text',
  path: 'truncate',
  shortDescription: 'Truncate your text easily',
  icon: 'material-symbols-light:short-text',
  description:
    'Load your text in the input form on the left and you will automatically get truncated text on the right.',
  keywords: ['text', 'truncate'],
  component: lazy(() => import('./index'))
});
