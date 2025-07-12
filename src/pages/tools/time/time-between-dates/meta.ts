import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  name: 'Time Between Dates',
  path: 'time-between-dates',
  icon: 'tabler:clock-minus',
  description:
    'Calculate the time difference between two dates with timezone support. Get days, hours, minutes, and seconds between dates.',
  shortDescription:
    'Calculate time difference between two dates with timezone support',
  keywords: ['time', 'dates', 'difference', 'calculate', 'between'],
  userTypes: ['General Users', 'Students'],
  component: lazy(() => import('./index'))
});
