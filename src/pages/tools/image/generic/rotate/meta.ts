import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  name: 'Rotate Image',
  path: 'rotate',
  icon: 'mdi:rotate-clockwise',
  description: 'Rotate an image by a specified angle.',
  shortDescription: 'Rotate an image easily.',
  keywords: ['rotate', 'image', 'angle', 'jpg', 'png'],
  component: lazy(() => import('./index'))
});
