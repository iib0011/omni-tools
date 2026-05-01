import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const meta = defineTool('pdf', {
  icon: 'ic:twotone-picture-as-pdf',
  component: lazy(() => import('./index')),
  keywords: ['pdf', 'image', 'extract'],
  path: 'extract-image-from-pdf',
  i18n: {
    name: 'pdf:extractImagesFromPdf.title',
    description: 'pdf:extractImagesFromPdf.description',
    shortDescription: 'pdf:extractImagesFromPdf.shortDescription',
    userTypes: ['generalUsers']
  }
});
