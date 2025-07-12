import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  name: 'Convert seconds to time',
  path: 'convert-seconds-to-time',
  icon: 'material-symbols:schedule',
  description:
    'Convert seconds to readable time format (HH:MM:SS). Useful for time calculations and formatting.',
  shortDescription: 'Convert seconds to time format (HH:MM:SS)',
  keywords: ['seconds', 'time', 'convert', 'format', 'HH:MM:SS'],
  userTypes: ['General Users', 'Students'],
  component: lazy(() => import('./index'))
});
