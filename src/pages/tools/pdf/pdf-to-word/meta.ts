import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('pdf', {
  i18n: {
    name: 'pdf:pdfToDocx.title',
    description: 'pdf:pdfToDocx.description',
    shortDescription: 'pdf:pdfToDocx.shortDescription',
    longDescription: 'pdf:pdfToDocx.longDescription',
    userTypes: ['generalUsers']
  },

  path: 'pdf-to-docx',
  icon: 'mdi:image-multiple', // Iconify icon ID

  keywords: ['pdf', 'png', 'convert', 'image', 'extract', 'pages'],
  component: lazy(() => import('./index'))
});
