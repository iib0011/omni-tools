import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  i18n: {
    name: 'image:resize.title',
    description: 'image:resize.description',
    shortDescription: 'image:resize.shortDescription'
  },
  name: 'Resize Image',
  path: 'resize',
  icon: 'mdi:resize', // Iconify icon as a string
  description:
    'Resize JPG, PNG, SVG or GIF images by pixels or percentage while maintaining aspect ratio or not.',
  shortDescription: 'Resize images easily.',
  keywords: [
    'resize',
    'image',
    'scale',
    'jpg',
    'png',
    'svg',
    'gif',
    'dimensions'
  ],
  component: lazy(() => import('./index'))
});
