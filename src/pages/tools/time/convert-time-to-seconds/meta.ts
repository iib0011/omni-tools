import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  path: 'convert-time-to-seconds',
  name: 'Convert Time to Seconds',
  icon: 'ic:round-timer-10-select',
  description:
    'With this browser-based application, you can convert clock time provided in hours, minutes, and seconds into just seconds. Given a time in HH:MM:SS format, it calculates HH*3600 + MM*60 + SS and prints this value in the output box. It supports AM/PM time formats as well as clock times beyond 24 hours.',
  shortDescription: 'Quickly convert clock time in H:M:S format to seconds.',
  keywords: ['convert', 'seconds', 'time', 'clock'],
  longDescription:
    'This is a quick online utility for calculating how many seconds there are in the given time. When you input a full clock time in the input box (in format H:M:S), it gets split into hours, minutes, and seconds, and using the math formula hours×60×60 plus minutes×60 plus seconds, it finds the seconds. If seconds are missing (format is H:M), then the formula becomes hours×60×60 plus minutes×60. If minutes are also missing, then the formula becomes hours×60×60. As an extra feature, hours, minutes, and seconds are not limited to just 24 hours, 60 minutes, and 60 seconds. You can use any hours value, any minutes value, and any seconds value. For example, the input time "72:00:00" will find the number of seconds in three days (72 hours is 3×24 hours) and the input time "0:1000:0" will find seconds in 1000 minutes. Timeabulous!',
  component: lazy(() => import('./index'))
});
