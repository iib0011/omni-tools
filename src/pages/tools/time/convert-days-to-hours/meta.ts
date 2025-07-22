import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  path: 'convert-days-to-hours',
  icon: 'material-symbols:schedule',

  keywords: ['days', 'hours', 'convert', 'time'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'time:convertDaysToHours.title',
    description: 'time:convertDaysToHours.description',
    shortDescription: 'time:convertDaysToHours.shortDescription',
    userTypes: ['generalUsers']
  }
});
