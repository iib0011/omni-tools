import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('pdf', {
  i18n: {
    name: 'pdf:rotatePdf.title',
    description: 'pdf:rotatePdf.description',
    shortDescription: 'pdf:rotatePdf.shortDescription',
    longDescription: 'pdf:rotatePdf.longDescription'
  },
  name: 'Rotate PDF',
  path: 'rotate-pdf',
  icon: 'carbon:rotate',
  description: 'Rotate PDF pages by 90, 180, or 270 degrees',
  shortDescription: 'Rotate pages in a PDF document',
  keywords: ['pdf', 'rotate', 'rotation', 'document', 'pages', 'orientation'],
  longDescription:
    'Change the orientation of PDF pages by rotating them 90, 180, or 270 degrees. Useful for fixing incorrectly scanned documents or preparing PDFs for printing.',
  component: lazy(() => import('./index'))
});
