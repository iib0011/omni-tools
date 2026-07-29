import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import { comparePdfIcon } from '../../../../lib/pdf-workbench/icons';

export const meta = defineTool('pdf', {
  icon: comparePdfIcon,
  component: lazy(() => import('./index')),
  keywords: [
    'compare',
    'difference',
    'visual diff',
    'text diff',
    'overlay',
    'review'
  ],
  path: 'compare-pdf',
  i18n: {
    name: 'pdf:comparePdf.title',
    description: 'pdf:comparePdf.description',
    shortDescription: 'pdf:comparePdf.shortDescription',
    longDescription: 'pdf:comparePdf.longDescription',
    userTypes: ['generalUsers']
  }
});
