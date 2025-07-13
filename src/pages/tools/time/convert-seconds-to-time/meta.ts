import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  name: 'Convert Seconds to Time',
  path: 'convert-seconds-to-time',
  icon: 'material-symbols:schedule',
  description:
    'Convert seconds to a readable time format (hours:minutes:seconds). Enter the number of seconds to get the formatted time.',
  shortDescription: 'Convert seconds to time format',
  keywords: ['seconds', 'time', 'convert', 'format'],
  component: lazy(() => import('./index')),
  i18n: {
    name: 'time.convertSecondsToTime.name',
    description: 'time.convertSecondsToTime.description',
    shortDescription: 'time.convertSecondsToTime.shortDescription'
  }
});
