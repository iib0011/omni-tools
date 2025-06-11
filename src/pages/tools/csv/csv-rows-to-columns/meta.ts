import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('csv', {
  name: i18n.t('convertCsvRowsToColumns'),
  path: 'csv-rows-to-columns',
  icon: 'fluent:text-arrow-down-right-column-24-filled',
  description: i18n.t('convertCsvRowsToColumnsDescription'),
  shortDescription: i18n.t('convertCsvRowsToColumnsShortDescription'),
  longDescription: i18n.t('convertCsvRowsToColumnsLongDescription'),
  keywords: ['csv', 'rows', 'columns', 'transpose'],
  component: lazy(() => import('./index'))
});
