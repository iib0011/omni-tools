import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  path: 'check-leap-years',
  icon: 'material-symbols:calendar-month',

  keywords: ['leap', 'year', 'calendar', 'date'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'time:checkLeapYears.title',
    description: 'time:checkLeapYears.description',
    shortDescription: 'time:checkLeapYears.shortDescription',
    userTypes: ['General Users', 'Students']
  }
});
