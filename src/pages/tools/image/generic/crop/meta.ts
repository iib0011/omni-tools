import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  i18n: {
    name: 'image:crop.title',
    description: 'image:crop.description',
    shortDescription: 'image:crop.shortDescription'
  },

  path: 'crop',
  icon: 'mdi:crop', // Iconify icon as a string

  keywords: ['crop', 'image', 'edit', 'resize', 'trim'],
  component: lazy(() => import('./index'))
});
