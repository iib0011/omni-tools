import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const meta = defineTool('pdf', {
  name: 'PDF to EPUB',
  shortDescription: 'Convert PDF files to EPUB format',
  description:
    'Transform PDF documents into EPUB files for better e-reader compatibility.',
  icon: 'material-symbols:import-contacts',
  component: lazy(() => import('./index')),
  keywords: ['pdf', 'epub', 'convert', 'ebook'],
  path: 'pdf-to-epub',
  i18n: {
    name: 'pdf.pdfToEpub.name',
    description: 'pdf.pdfToEpub.description',
    shortDescription: 'pdf.pdfToEpub.shortDescription'
  }
});
