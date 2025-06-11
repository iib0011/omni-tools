import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('time', {
  path: 'convert-days-to-hours',
  name: i18n.t('convertDaysToHours'),
  icon: 'ri:24-hours-line',
  description: i18n.t('convertDaysToHoursDescription'),
  shortDescription: i18n.t('convertDaysToHoursShortDescription'),
  keywords: ['convert', 'days', 'hours'],
  longDescription: i18n.t('convertDaysToHoursLongDescription'),
  component: lazy(() => import('./index'))
});
