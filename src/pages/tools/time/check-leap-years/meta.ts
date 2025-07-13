import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  name: 'Check Leap Years',
  path: 'check-leap-years',
  icon: 'material-symbols:calendar-month',
  description:
    'Check if a year is a leap year. Enter a year to determine if it has 366 days instead of 365.',
  shortDescription: 'Check if a year is a leap year',
  keywords: ['leap', 'year', 'calendar', 'date'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'time:checkLeapYears.title',
    description: 'time:checkLeapYears.description',
    shortDescription: 'time:checkLeapYears.shortDescription'
  }
});
