import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('pdf', {
  i18n: {
    name: 'pdf:markdownToPdf.title',
    description: 'pdf:markdownToPdf.description',
    shortDescription: 'pdf:markdownToPdf.shortDescription',
    longDescription: 'pdf:markdownToPdf.longDescription'
  },
  path: 'markdown-to-pdf',
  icon: 'mdi:file-document-outline',
  keywords: [
    'markdown',
    'md',
    'pdf',
    'report',
    'audit',
    'documentation',
    'readme'
  ],
  component: lazy(() => import('./index'))
});
