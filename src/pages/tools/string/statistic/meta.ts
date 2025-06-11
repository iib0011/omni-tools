import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('string', {
  name: i18n.t('textStatistic'),
  path: 'statistics',
  icon: 'fluent:document-landscape-data-24-filled',
  description: i18n.t('textStatisticDescription'),
  shortDescription: i18n.t('textStatisticShortDescription'),
  longDescription: i18n.t('textStatisticLongDescription'),
  keywords: ['text', 'statistics', 'count', 'lines', 'words', 'characters'],
  component: lazy(() => import('./index'))
});
