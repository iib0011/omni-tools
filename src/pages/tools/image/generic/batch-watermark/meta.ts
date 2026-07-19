import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('image-generic', {
  i18n: {
    name: 'image:batchWatermark.title',
    description: 'image:batchWatermark.description',
    shortDescription: 'image:batchWatermark.shortDescription',
    userTypes: ['generalUsers']
  },

  path: 'batch-watermark',
  icon: 'mdi:watermark',

  keywords: [
    'watermark',
    'batch',
    'image',
    'text',
    'filename',
    'overlay',
    'png',
    'jpg'
  ],

  component: lazy(() => import('./index'))
});
