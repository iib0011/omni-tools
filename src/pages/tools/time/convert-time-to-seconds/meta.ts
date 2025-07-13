import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  name: 'Convert Time to Seconds',
  path: 'convert-time-to-seconds',
  icon: 'material-symbols:schedule',
  description:
    'Convert time format (hours:minutes:seconds) to total seconds. Enter time in HH:MM:SS format to get the total seconds.',
  shortDescription: 'Convert time format to seconds',
  keywords: ['time', 'seconds', 'convert', 'format'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'time:convertTimeToSeconds.title',
    description: 'time:convertTimeToSeconds.description',
    shortDescription: 'time:convertTimeToSeconds.shortDescription'
  }
});
