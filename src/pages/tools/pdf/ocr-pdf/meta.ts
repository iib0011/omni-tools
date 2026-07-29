import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import { ocrPdfIcon } from '../../../../lib/pdf-workbench/icons';

export const tool = defineTool('pdf', {
  path: 'ocr-pdf',
  icon: ocrPdfIcon,
  keywords: ['ocr', 'searchable', 'scan', 'text layer', 'tesseract', 'pdf'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'pdf:ocrPdf.title',
    description: 'pdf:ocrPdf.description',
    shortDescription: 'pdf:ocrPdf.shortDescription',
    longDescription: 'pdf:ocrPdf.longDescription',
    userTypes: ['generalUsers']
  }
});
