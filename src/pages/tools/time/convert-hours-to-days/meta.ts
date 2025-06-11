import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('time', {
  path: 'convert-hours-to-days',
  name: i18n.t('convertHoursToDays'),
  icon: 'mdi:hours-24',
  description: i18n.t('convertHoursToDaysDescription'),
  shortDescription: i18n.t('convertHoursToDaysShortDescription'),
  longDescription: i18n.t('convertHoursToDaysLongDescription'),
  keywords: ['convert', 'hours', 'days'],
  component: lazy(() => import('./index'))
});
