import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  name: 'Time Between Dates',
  path: 'time-between-dates',
  icon: 'material-symbols:schedule',
  description:
    'Calculate the time difference between two dates. Get the exact duration in days, hours, minutes, and seconds.',
  shortDescription: 'Calculate time between two dates',
  keywords: ['dates', 'time', 'difference', 'duration', 'calculate'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'time.timeBetweenDates.name',
    description: 'time.timeBetweenDates.description',
    shortDescription: 'time.timeBetweenDates.shortDescription'
  }
});
