import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const meta = defineTool('pdf', {
  icon: 'material-symbols:description',
  component: lazy(() => import('./index')),
  keywords: ['pdf', 'word', 'docx', 'convert', 'document'],
  path: 'pdf-to-word',
  i18n: {
    name: 'pdf:pdfToWord.title',
    description: 'pdf:pdfToWord.description',
    shortDescription: 'pdf:pdfToWord.shortDescription',
    userTypes: ['generalUsers']
  }
});
