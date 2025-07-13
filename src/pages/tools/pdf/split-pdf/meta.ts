import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const meta = defineTool('pdf', {
  name: 'Split PDF',
  shortDescription: 'Extract specific pages from a PDF file',
  description:
    'Extract specific pages from a PDF file using page numbers or ranges (e.g., 1,5-8)',
  icon: 'material-symbols-light:call-split-rounded',
  component: lazy(() => import('./index')),
  keywords: ['pdf', 'split', 'extract', 'pages', 'range', 'document'],
  path: 'split-pdf',
  i18n: {
    name: 'pdf:splitPdf.title',
    description: 'pdf:splitPdf.description',
    shortDescription: 'pdf:splitPdf.shortDescription'
  }
});
