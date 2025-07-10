import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  path: 'convert-date-to-epoch',
  name: 'Convert Date to Epoch',
  icon: 'ic:round-schedule',
  description:
    'Convert between dates and Unix epoch timestamps bidirectionally. This tool supports converting human-readable dates to Unix epoch timestamps (seconds since January 1, 1970 UTC) and vice versa. It handles multiple date formats including ISO 8601, MM/DD/YYYY, DD/MM/YYYY, and YYYY-MM-DD formats. Perfect for converting between human-readable dates and Unix timestamps for programming and database usage.',
  shortDescription: 'Convert between dates and Unix epoch timestamps.',
  keywords: [
    'convert',
    'epoch',
    'unix',
    'timestamp',
    'date',
    'time',
    'bidirectional'
  ],
  longDescription:
    'This is a quick online utility for converting between dates and Unix epoch timestamps bidirectionally. Unix epoch time is the number of seconds that have elapsed since January 1, 1970, at 00:00:00 UTC. This tool supports two modes: Date to Epoch and Epoch to Date. In Date to Epoch mode, it converts various date formats including ISO 8601 (YYYY-MM-DDTHH:mm:ssZ), YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY, and many other common formats to Unix timestamps. In Epoch to Date mode, it converts Unix epoch timestamps back to human-readable dates in YYYY-MM-DD HH:mm:ss UTC format. You can input multiple values (one per line) and the tool will convert each accordingly. The tool automatically handles timezone conversions to UTC for accurate epoch calculation and provides clear error messages for invalid inputs. This is particularly useful for developers working with databases, APIs, or any system that stores dates as Unix timestamps.',
  component: lazy(() => import('./index'))
});
