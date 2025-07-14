import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  i18n: {
    name: 'image:removeBackground.title',
    description: 'image:removeBackground.description',
    shortDescription: 'image:removeBackground.shortDescription'
  },

  path: 'remove-background',
  icon: 'mdi:image-remove',

  keywords: [
    'remove',
    'background',
    'png',
    'transparent',
    'image',
    'ai',
    'jpg'
  ],
  component: lazy(() => import('./index'))
});
