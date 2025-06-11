import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('csv', {
  name: i18n.t('convertCsvToTsv'),
  path: 'csv-to-tsv',
  icon: 'codicon:keyboard-tab',
  description: i18n.t('convertCsvToTsvDescription'),
  shortDescription: i18n.t('convertCsvToTsvShortDescription'),
  longDescription: i18n.t('convertCsvToTsvLongDescription'),
  keywords: ['csv', 'tsv', 'convert', 'transform', 'parse'],
  component: lazy(() => import('./index'))
});
