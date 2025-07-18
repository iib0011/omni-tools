import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  i18n: {
    name: 'image:compress.title',
    description: 'image:compress.description',
    shortDescription: 'image:compress.shortDescription',
    userTypes: ['General Users', 'Students', 'Developers']
  },

  path: 'compress',
  icon: 'material-symbols-light:compress-rounded',

  keywords: ['image', 'compress', 'reduce', 'quality'],
  component: lazy(() => import('./index'))
});
