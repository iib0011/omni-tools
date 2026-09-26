import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  i18n: {
    name: 'image:watermark.title',
    description: 'image:watermark.description',
    shortDescription: 'image:watermark.shortDescription',
    userTypes: ['generalUsers']
  },

  path: 'watermark',
  icon: 'mdi:watermark',

  keywords: [
    'watermark',
    'image',
    'text',
    'filename',
    'overlay',
    'branding',
    'stamp'
  ],

  component: lazy(() => import('./index'))
});
