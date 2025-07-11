import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  name: 'Epoch Converter',
  path: 'epoch-converter',
  icon: 'mdi:clock-time-four-outline',
  description:
    'Convert Unix epoch timestamps to human-readable dates and vice versa.',
  shortDescription: 'Convert between Unix timestamps and dates.',
  keywords: [
    'epoch',
    'converter',
    'timestamp',
    'date',
    'unix',
    'time',
    'convert'
  ],
  longDescription:
    'Enter a Unix timestamp (in seconds or milliseconds) to get a human-readable date, or enter a date string (e.g., 2021-01-01T00:00:00Z) to get the corresponding Unix timestamp. Useful for developers, sysadmins, and anyone working with time data.',
  component: lazy(() => import('./index'))
});
