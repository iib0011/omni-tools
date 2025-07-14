import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  i18n: {
    name: 'image:rotate.title',
    description: 'image:rotate.description',
    shortDescription: 'image:rotate.shortDescription'
  },

  path: 'rotate',
  icon: 'mdi:rotate-clockwise',

  keywords: ['rotate', 'image', 'angle', 'jpg', 'png'],
  component: lazy(() => import('./index'))
});
