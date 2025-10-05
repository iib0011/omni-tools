import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  i18n: {
    name: 'string:textCompare.title',
    description: 'string:textCompare.description',
    shortDescription: 'string:textCompare.shortDescription',
    longDescription: 'string:textCompare.longDescription'
  },
  path: 'text-compare',
  icon: 'material-symbols-light:search',
  keywords: ['text', 'compare'],
  component: lazy(() => import('./index'))
});
