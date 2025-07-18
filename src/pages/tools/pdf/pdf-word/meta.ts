import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('pdf', {
  i18n: {
    // Changed direct strings to i18n keys
    name: 'pdf:pdfToWord.name',
    description: 'pdf:pdfToWord.description',
    shortDescription: 'pdf:pdfToWord.shortDescription',
    longDescription: 'pdf:pdfToWord.longDescription'
  },
  path: 'pdf-word',
  icon: 'material-symbols:description',
  keywords: ['pdf', 'word', 'pdf to word', 'convert', 'document'],
  component: lazy(() => import('./index'))
});
