import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  i18n: {
    name: 'image:split.title',
    description: 'image:split.description',
    shortDescription: 'image:split.shortDescription'
  },
  path: 'split',
  icon: 'mdi:scissors',
  keywords: ['split'],
  component: lazy(() => import('./index'))
});
