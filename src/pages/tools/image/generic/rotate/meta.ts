import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  i18n: {
    name: 'image:rotate.title',
    description: 'image:rotate.description',
    shortDescription: 'image:rotate.shortDescription'
  },
  name: 'Rotate Image',
  path: 'rotate',
  icon: 'mdi:rotate-clockwise',
  description: 'Rotate an image by a specified angle.',
  shortDescription: 'Rotate an image easily.',
  keywords: ['rotate', 'image', 'angle', 'jpg', 'png'],
  component: lazy(() => import('./index'))
});
