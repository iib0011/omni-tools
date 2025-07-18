import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  path: 'time-between-dates',
  icon: 'material-symbols:schedule',

  keywords: ['dates', 'time', 'difference', 'duration', 'calculate'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'time:timeBetweenDates.title',
    description: 'time:timeBetweenDates.description',
    shortDescription: 'time:timeBetweenDates.shortDescription',
    userTypes: ['General Users', 'Students', 'Developers']
  }
});
