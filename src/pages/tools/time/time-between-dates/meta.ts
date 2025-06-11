import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';
import i18n from 'i18n/i18n';

export const tool = defineTool('time', {
  name: i18n.t('timeBetweenDates'),
  path: 'time-between-dates',
  icon: 'tabler:clock-minus',
  description: i18n.t('timeBetweenDatesDescription'),
  shortDescription: i18n.t('timeBetweenDatesShortDescription'),
  longDescription: i18n.t('timeBetweenDatesLongDescription'),
  keywords: [
    'time',
    'dates',
    'difference',
    'duration',
    'calculator',
    'timezones',
    'interval'
  ],
  component: lazy(() => import('./index'))
});
