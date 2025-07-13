import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  name: 'Truncate Clock Time',
  path: 'truncate-clock-time',
  icon: 'material-symbols:schedule',
  description:
    'Truncate clock time to remove seconds or minutes. Round time to the nearest hour, minute, or custom interval.',
  shortDescription: 'Truncate clock time to specified precision',
  keywords: ['time', 'truncate', 'clock', 'round', 'precision'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'time.truncateClockTime.name',
    description: 'time.truncateClockTime.description',
    shortDescription: 'time.truncateClockTime.shortDescription'
  }
});
