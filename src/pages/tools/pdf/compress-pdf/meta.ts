import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('pdf', {
  name: i18n.t('compressPdf'),
  path: 'compress-pdf',
  icon: 'material-symbols:compress',
  description: i18n.t('compressPdfLongDescription'),
  shortDescription: i18n.t('compressPdfShortDescription'),
  longDescription: i18n.t('compressPdfLongDescription'),
  keywords: [
    'pdf',
    'compress',
    'reduce',
    'size',
    'optimize',
    'shrink',
    'file size',
    'ghostscript',
    'secure',
    'private',
    'browser',
    'webassembly'
  ],
  component: lazy(() => import('./index'))
});
