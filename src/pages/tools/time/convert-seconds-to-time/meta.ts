import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('time', {
  path: 'convert-seconds-to-time',
  name: i18n.t('convertSecondsToTime'),
  icon: 'fluent-mdl2:time-picker',
  description: i18n.t('convertSecondsToTimeDescription'),
  shortDescription: i18n.t('convertSecondsToTimeShortDescription'),
  longDescription: i18n.t('convertSecondsToTimeLongDescription'),
  keywords: ['convert', 'seconds', 'time', 'clock'],
  component: lazy(() => import('./index'))
});
