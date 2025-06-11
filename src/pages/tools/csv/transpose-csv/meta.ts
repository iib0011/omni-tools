import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('csv', {
  name: i18n.t('transposeCsv'),
  path: 'transpose-csv',
  icon: 'carbon:transpose',
  description: i18n.t('transposeCsvDescription'),
  shortDescription: i18n.t('transposeCsvShortDescription'),
  longDescription: i18n.t('transposeCsvLongDescription'),
  keywords: ['transpose', 'csv'],
  component: lazy(() => import('./index'))
});
