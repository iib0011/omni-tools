import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  i18n: {
    name: 'image:resize.title',
    description: 'image:resize.description',
    shortDescription: 'image:resize.shortDescription',
    userTypes: ['General Users', 'Students', 'Developers']
  },

  path: 'resize',
  icon: 'mdi:resize', // Iconify icon as a string

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
