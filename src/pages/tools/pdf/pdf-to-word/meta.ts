import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('pdf', {
  i18n: {
    name: 'pdf:pdfToWord.title',
    description: 'pdf:pdfToWord.description',
    shortDescription: 'pdf:pdfToWord.shortDescription',
    longDescription: 'pdf:pdfToWord.longDescription',
    userTypes: ['generalUsers']
  },

  path: 'pdf-to-word',
  icon: 'material-symbols:description', // Word document icon

  keywords: ['pdf', 'word', 'docx', 'convert', 'document', 'text', 'office'],
  component: lazy(() => import('./index'))
});
