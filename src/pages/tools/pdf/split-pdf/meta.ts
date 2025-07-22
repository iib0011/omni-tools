import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const meta = defineTool('pdf', {
  icon: 'material-symbols-light:call-split-rounded',
  component: lazy(() => import('./index')),
  keywords: ['pdf', 'split', 'extract', 'pages', 'range', 'document'],
  path: 'split-pdf',
  i18n: {
    name: 'pdf:splitPdf.title',
    description: 'pdf:splitPdf.description',
    shortDescription: 'pdf:splitPdf.shortDescription',
    userTypes: ['General Users']
  }
});
