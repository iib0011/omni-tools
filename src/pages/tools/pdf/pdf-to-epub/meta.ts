import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const meta = defineTool('pdf', {
  name: i18n.t('pdfToEpub'),
  description: i18n.t('pdfToEpubDescription'),
  shortDescription: i18n.t('pdfToEpubShortDescription'),
  longDescription: i18n.t('pdfToEpubLongDescription'),
  icon: 'material-symbols:import-contacts',
  component: lazy(() => import('./index')),
  keywords: ['pdf', 'epub', 'convert', 'ebook'],
  path: 'pdf-to-epub'
});
