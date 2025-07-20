import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  i18n: {
    name: 'image:heicConverter.title',
    description: 'image:heicConverter.description',
    shortDescription: 'image:heicConverter.shortDescription',
    longDescription: 'image:heicConverter.longDescription'
  },
  path: 'heic-converter',
  icon: 'mdi:image-multiple-outline',
  keywords: [
    'heic',
    'heif',
    'converter',
    'image',
    'format',
    'convert',
    'iphone',
    'apple'
  ],
  component: lazy(() => import('./index'))
});
