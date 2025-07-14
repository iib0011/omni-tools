import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  i18n: {
    name: 'image:convertToJpg.title',
    description: 'image:convertToJpg.description',
    shortDescription: 'image:convertToJpg.shortDescription'
  },

  path: 'convert-to-jpg',
  icon: 'ph:file-jpg-thin',

  keywords: [
    'convert',
    'jpg',
    'jpeg',
    'png',
    'gif',
    'tiff',
    'webp',
    'heic',
    'raw',
    'psd',
    'svg',
    'quality',
    'compression'
  ],
  component: lazy(() => import('./index'))
});
