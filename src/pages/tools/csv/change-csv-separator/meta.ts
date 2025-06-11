import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('csv', {
  name: i18n.t('changeCsvSeparator'),
  path: 'change-csv-separator',
  icon: 'material-symbols:split-scene-rounded',
  description: i18n.t('changeCsvSeparatorDescription'),
  shortDescription: i18n.t('changeCsvSeparatorShortDescription'),
  longDescription: i18n.t('changeCsvSeparatorLongDescription'),
  keywords: ['change', 'csv', 'separator'],
  component: lazy(() => import('./index'))
});
