import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const meta = defineTool('pdf', {
  icon: 'material-symbols-light:merge',
  component: lazy(() => import('./index')),
  keywords: ['pdf', 'merge', 'extract', 'pages', 'combine', 'document'],
  path: 'merge-pdf',
  i18n: {
    name: 'pdf:mergePdf.title',
    description: 'pdf:mergePdf.description',
    shortDescription: 'pdf:mergePdf.shortDescription',
    userTypes: ['General Users']
  }
});
