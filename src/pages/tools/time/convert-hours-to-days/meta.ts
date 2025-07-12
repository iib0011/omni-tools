import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  name: 'Convert hours to days',
  path: 'convert-hours-to-days',
  icon: 'material-symbols:schedule',
  description:
    'Convert hours to days with simple calculations. Useful for time tracking and scheduling.',
  shortDescription: 'Convert hours to days easily.',
  keywords: ['hours', 'days', 'convert', 'time', 'calculation'],
  userTypes: ['General Users', 'Students'],
  component: lazy(() => import('./index'))
});
