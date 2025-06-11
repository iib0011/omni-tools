import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const meta = defineTool('pdf', {
  name: i18n.t('splitPdf'),
  shortDescription: i18n.t('splitPdfShortDescription'),
  description: i18n.t('splitPdfLongDescription'),
  longDescription: i18n.t('splitPdfLongDescription'),
  icon: 'material-symbols-light:call-split-rounded',
  component: lazy(() => import('./index')),
  keywords: ['pdf', 'split', 'extract', 'pages', 'range', 'document'],
  path: 'split-pdf'
});
