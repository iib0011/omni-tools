import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('csv', {
  name: i18n.t('insertCsvColumns'),
  path: 'insert-csv-columns',
  icon: 'hugeicons:column-insert',
  description: i18n.t('insertCsvColumnsDescription'),
  shortDescription: i18n.t('insertCsvColumnsShortDescription'),
  keywords: ['insert', 'csv', 'columns', 'append', 'prepend'],
  longDescription: '',
  component: lazy(() => import('./index'))
});
