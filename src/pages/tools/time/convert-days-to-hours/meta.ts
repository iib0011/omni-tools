import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  name: 'Convert days to hours',
  path: 'convert-days-to-hours',
  icon: 'material-symbols:schedule',
  description:
    'Convert days to hours with simple calculations. Useful for time tracking and scheduling.',
  shortDescription: 'Convert days to hours easily.',
  keywords: ['days', 'hours', 'convert', 'time', 'calculation'],
  userTypes: ['General Users', 'Students'],
  component: lazy(() => import('./index'))
});
