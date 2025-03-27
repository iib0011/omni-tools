import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  name: 'Time Between Dates',
  path: 'time-between-dates',
  icon: 'mdi:calendar-clock',
  description:
    'Calculate the exact time difference between two dates and times, with support for different timezones. This tool provides a detailed breakdown of the time difference in various units (years, months, days, hours, minutes, and seconds).',
  shortDescription:
    'Calculate the precise time duration between two dates with timezone support.',
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
