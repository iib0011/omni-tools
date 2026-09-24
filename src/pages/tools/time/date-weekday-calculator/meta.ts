import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  path: 'date-weekday-calculator',
  icon: 'material-symbols:calendar-month',

  keywords: [
    'date',
    'weekday',
    'day of week',
    'calendar',
    'year',
    'matching years',
    'what day',
    'leap day'
  ],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'time:dateWeekdayCalculator.title',
    description: 'time:dateWeekdayCalculator.description',
    shortDescription: 'time:dateWeekdayCalculator.shortDescription',
    longDescription: 'time:dateWeekdayCalculator.longDescription',
    userTypes: ['generalUsers']
  }
});
