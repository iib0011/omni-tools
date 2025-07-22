import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('pdf', {
  i18n: {
    name: 'pdf:rotatePdf.title',
    description: 'pdf:rotatePdf.description',
    shortDescription: 'pdf:rotatePdf.shortDescription',
    longDescription: 'pdf:rotatePdf.longDescription',
    userTypes: ['generalUsers']
  },

  path: 'rotate-pdf',
  icon: 'carbon:rotate',

  keywords: ['pdf', 'rotate', 'rotation', 'document', 'pages', 'orientation'],
  component: lazy(() => import('./index'))
});
