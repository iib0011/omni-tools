import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  i18n: {
    name: 'image:convertToWebp.title',
    description: 'image:convertToWebp.description',
    shortDescription: 'image:convertToWebp.shortDescription'
  },

  path: 'convert-to-webp',
  icon: 'iconoir:media-image-list',

  keywords: ['convert', 'jpg', 'jpeg', 'png', 'webp', 'compression'],
  component: lazy(() => import('./index'))
});
