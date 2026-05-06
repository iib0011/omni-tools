import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('pdf', {
  i18n: {
    name: 'pdf:convertToPdf.title',
    description: 'pdf:convertToPdf.description',
    shortDescription: 'pdf:convertToPdf.shortDescription'
  },

  path: 'convert-to-pdf',
  icon: 'ph:file-pdf-thin',

  keywords: [
    'convert',
    'pdf',
    'image',
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp',
    'heic',
    'heif',
    'quality'
  ],
  component: lazy(() => import('./index'))
});
