import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('pdf', {
  i18n: {
    name: 'pdf:pdfToWord.name',
    description: 'pdf:pdfToWord.description',
    shortDescription: 'pdf:pdfToWord.shortDescription',
    longDescription: 'pdf:pdfToWord.description'
  },
  path: 'pdf-to-word',
  icon: 'mdi:file-word', // You can change this icon ID if needed
  keywords: ['pdf', 'word', 'convert', 'docx'],
  component: lazy(() => import('./index'))
});
