import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  name: 'Convert Hours to Days',
  path: 'convert-hours-to-days',
  icon: 'material-symbols:schedule',
  description:
    'Convert hours to days. Enter the number of hours to get the equivalent number of days.',
  shortDescription: 'Convert hours to days',
  keywords: ['hours', 'days', 'convert', 'time'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'time.convertHoursToDays.name',
    description: 'time.convertHoursToDays.description',
    shortDescription: 'time.convertHoursToDays.shortDescription'
  }
});
