import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const meta = defineTool('pdf', {
  icon: 'material-symbols:import-contacts',
  component: lazy(() => import('./index')),
  keywords: ['pdf', 'epub', 'convert', 'ebook'],
  path: 'pdf-to-epub',
  i18n: {
    name: 'pdf:pdfToEpub.title',
    description: 'pdf:pdfToEpub.description',
    shortDescription: 'pdf:pdfToEpub.shortDescription',
    userTypes: ['General Users']
  }
});
