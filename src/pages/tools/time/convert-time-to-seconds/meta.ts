import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  name: 'Convert time to seconds',
  path: 'convert-time-to-seconds',
  icon: 'material-symbols:schedule',
  description:
    'Convert time format (HH:MM:SS) to total seconds. Useful for time calculations and programming.',
  shortDescription: 'Convert time format (HH:MM:SS) to seconds',
  keywords: ['time', 'seconds', 'convert', 'format', 'HH:MM:SS'],
  userTypes: ['General Users', 'Students', 'Developers'],
  component: lazy(() => import('./index'))
});
