import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import { organizePdfIcon } from '../../../../lib/pdf-workbench/icons';

export const tool = defineTool('pdf', {
  i18n: {
    name: 'pdf:organizePdf.title',
    description: 'pdf:organizePdf.description',
    shortDescription: 'pdf:organizePdf.shortDescription',
    longDescription: 'pdf:organizePdf.longDescription',
    userTypes: ['generalUsers']
  },
  path: 'organize-pdf',
  icon: organizePdfIcon,
  keywords: [
    'organize',
    'reorder',
    'pages',
    'duplicate',
    'delete',
    'blank',
    'pdf'
  ],
  component: lazy(() => import('./index'))
});
