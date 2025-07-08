import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  path: 'convert-date-to-epoch',
  name: 'Convert Date to Epoch',
  icon: 'ic:round-schedule',
  description:
    'Convert dates and times to Unix epoch timestamps (seconds since January 1, 1970 UTC). This tool supports multiple date formats including ISO 8601, MM/DD/YYYY, DD/MM/YYYY, and YYYY-MM-DD formats. Perfect for converting human-readable dates to Unix timestamps for programming and database usage.',
  shortDescription: 'Convert dates to Unix epoch timestamps.',
  keywords: ['convert', 'epoch', 'unix', 'timestamp', 'date', 'time'],
  longDescription:
    'This is a quick online utility for converting dates and times to Unix epoch timestamps. Unix epoch time is the number of seconds that have elapsed since January 1, 1970, at 00:00:00 UTC. This tool supports various date formats including ISO 8601 (YYYY-MM-DDTHH:mm:ssZ), YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY, and many other common formats. You can input multiple dates (one per line) and the tool will convert each to its corresponding epoch timestamp. If you input an existing epoch timestamp, it will be validated and passed through. The tool automatically handles timezone conversions to UTC for accurate epoch calculation. This is particularly useful for developers working with databases, APIs, or any system that stores dates as Unix timestamps.',
  component: lazy(() => import('./index'))
});
