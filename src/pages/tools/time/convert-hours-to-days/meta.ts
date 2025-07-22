import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  path: 'convert-hours-to-days',
  icon: 'material-symbols:schedule',

  keywords: ['hours', 'days', 'convert', 'time'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'time:convertHoursToDays.title',
    description: 'time:convertHoursToDays.description',
    shortDescription: 'time:convertHoursToDays.shortDescription',
    userTypes: ['generalUsers']
  }
});
