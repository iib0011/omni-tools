import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('time', {
  path: 'truncate-clock-time',
  name: i18n.t('truncateClockTime'),
  icon: 'mdi:clock-remove-outline',
  description: i18n.t('truncateClockTimeDescription'),
  shortDescription: i18n.t('truncateClockTimeShortDescription'),
  longDescription: i18n.t('truncateClockTimeLongDescription'),
  keywords: ['truncate', 'time', 'clock'],
  component: lazy(() => import('./index'))
});
