import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  path: 'convert-time-to-seconds',
  icon: 'material-symbols:schedule',

  keywords: ['time', 'seconds', 'convert', 'format', 'HH:MM:SS'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'time:convertTimeToSeconds.title',
    description: 'time:convertTimeToSeconds.description',
    shortDescription: 'time:convertTimeToSeconds.shortDescription',
    userTypes: ['General Users', 'Students', 'Developers']
  }
});
