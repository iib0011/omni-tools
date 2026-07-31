import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  i18n: {
    name: 'image:split.title',
    description: 'image:split.description',
    shortDescription: 'image:split.shortDescription'
  },
  path: 'split-to-pages',
  icon: 'mdi:scissors',
  keywords: ['split', 'images', 'pages', 'large', 'map'],
  component: lazy(() => import('./index'))
});
