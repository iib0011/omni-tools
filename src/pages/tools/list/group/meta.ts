import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('list', {
  path: 'chunk',
  icon: 'mdi:rhombus-split',

  keywords: ['chuck', 'list', 'partition', 'split'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'list:chunk.title',
    description: 'list:chunk.description',
    shortDescription: 'list:chunk.shortDescription',
    userTypes: ['generalUsers', 'developers']
  }
});
