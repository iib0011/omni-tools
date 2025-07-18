import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  path: 'truncate-clock-time',
  icon: 'material-symbols:schedule',

  keywords: ['time', 'truncate', 'clock', 'round', 'precision'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'time:truncateClockTime.title',
    description: 'time:truncateClockTime.description',
    shortDescription: 'time:truncateClockTime.shortDescription',
    userTypes: ['General Users', 'Students', 'Developers']
  }
});
