import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const meta = defineTool('pdf', {
  name: i18n.t('mergePdf'),
  description: i18n.t('mergePdfDescription'),
  shortDescription: i18n.t('mergePdfShortDescription'),
  longDescription: i18n.t('mergePdfLongDescription'),
  icon: 'material-symbols-light:merge',
  component: lazy(() => import('./index')),
  keywords: ['pdf', 'merge', 'extract', 'pages', 'combine', 'document'],
  path: 'merge-pdf'
});
