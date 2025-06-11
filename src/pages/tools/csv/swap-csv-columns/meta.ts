import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('csv', {
  name: i18n.t('swapCsvColumns'),
  path: 'swap-csv-columns',
  icon: 'eva:swap-outline',
  description: i18n.t('swapCsvColumnsDescription'),
  shortDescription: i18n.t('swapCsvColumnsShortDescription'),
  longDescription: i18n.t('swapCsvColumnsLongDescription'),
  keywords: ['csv', 'swap', 'columns'],
  component: lazy(() => import('./index'))
});
