import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('string', {
  i18n: {
    name: 'string:unicode.title',
    description: 'string:unicode.description',
    shortDescription: 'string:unicode.shortDescription',
    longDescription: 'string:unicode.longDescription'
  },
  path: 'unicode',
  icon: 'mdi:unicode',
  keywords: ['unicode'],
  component: lazy(() => import('./index'))
});
