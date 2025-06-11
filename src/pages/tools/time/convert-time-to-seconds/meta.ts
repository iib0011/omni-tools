import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('time', {
  path: 'convert-time-to-seconds',
  name: i18n.t('convertTimeToSeconds'),
  icon: 'ic:round-timer-10-select',
  description: i18n.t('convertTimeToSecondsDescription'),
  shortDescription: i18n.t('convertTimeToSecondsShortDescription'),
  longDescription: i18n.t('convertTimeToSecondsLongDescription'),
  keywords: ['convert', 'seconds', 'time', 'clock'],
  component: lazy(() => import('./index'))
});
