import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('list', {
  name: i18n.t('truncate'),
  path: 'truncate',
  icon: 'mdi:format-horizontal-align-right',
  description: i18n.t('truncateDescription'),
  shortDescription: i18n.t('truncateShortDescription'),
  longDescription: i18n.t('truncateLongDescription'),
  keywords: ['truncate'],
  component: lazy(() => import('./index'))
});
