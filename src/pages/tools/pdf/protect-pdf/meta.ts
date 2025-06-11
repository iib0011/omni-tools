import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('pdf', {
  name: i18n.t('protectPdf'),
  path: 'protect-pdf',
  icon: 'material-symbols:lock',
  description: i18n.t('protectPdfLongDescription'),
  shortDescription: i18n.t('protectPdfShortDescription'),
  longDescription: i18n.t('protectPdfLongDescription'),
  keywords: [
    'pdf',
    'protect',
    'password',
    'secure',
    'encrypt',
    'lock',
    'private',
    'confidential',
    'security',
    'browser',
    'encryption'
  ],
  component: lazy(() => import('./index'))
});
