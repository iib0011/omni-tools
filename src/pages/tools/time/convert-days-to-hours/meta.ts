import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  name: 'Convert Days to Hours',
  path: 'convert-days-to-hours',
  icon: 'material-symbols:schedule',
  description:
    'Convert days to hours. Enter the number of days to get the equivalent number of hours.',
  shortDescription: 'Convert days to hours',
  keywords: ['days', 'hours', 'convert', 'time'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'time.convertDaysToHours.name',
    description: 'time.convertDaysToHours.description',
    shortDescription: 'time.convertDaysToHours.shortDescription'
  }
});
