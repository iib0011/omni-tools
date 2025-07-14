import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('pdf', {
  i18n: {
    name: 'pdf:pdfToPng.title',
    description: 'pdf:pdfToPng.description',
    shortDescription: 'pdf:pdfToPng.shortDescription',
    longDescription: 'pdf:pdfToPng.longDescription'
  },

  path: 'pdf-to-png',
  icon: 'mdi:image-multiple', // Iconify icon ID

  keywords: ['pdf', 'png', 'convert', 'image', 'extract', 'pages'],

  component: lazy(() => import('./index'))
});
