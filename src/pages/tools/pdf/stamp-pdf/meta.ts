import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import { stampPdfIcon } from '../../../../lib/pdf-workbench/icons';

export const tool = defineTool('pdf', {
  path: 'stamp-pdf',
  icon: stampPdfIcon,
  keywords: ['stamp', 'watermark', 'page numbers', 'bates', 'header', 'footer'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'pdf:stampPdf.title',
    description: 'pdf:stampPdf.description',
    shortDescription: 'pdf:stampPdf.shortDescription',
    userTypes: ['generalUsers']
  }
});
