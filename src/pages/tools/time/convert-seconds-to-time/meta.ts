import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  path: 'convert-seconds-to-time',
  name: 'Convert Seconds to Time',
  icon: 'fluent-mdl2:time-picker',
  description:
    'With this browser-based application, you can convert seconds to clock time. Given the seconds input value, it converts them into full hours (H), minutes (M), and seconds (S) and prints them in human-readable clock format (H:M:S or HH:MM:SS) in the output field.',
  shortDescription: 'Quicky convert seconds to clock time in H:M:S format.',
  keywords: ['convert', 'seconds', 'time', 'clock'],
  longDescription:
    'This is a quick online utility for converting seconds to H:M:S or HH:MM:SS digital clock time format. It calculates the number of full hours, full minutes, and remaining seconds from the input seconds and outputs regular clock time. For example, 100 seconds is 1 minute and 40 seconds so we get the clock time 00:01:40. To convert seconds to human-readable time we use the Euclidean division algorithm, also known as a division with remainder. If "n" is the input seconds value, then the hours "h" are calculated from the formula n = 3600×h + r, where r is the remainder of dividing n by 3600. Minutes "m" are calculated from the formula r = 60×m + s, and seconds "s" is the remainder of dividing r by 60. For example, if the input n = 4000, then 4000 = 3600×1 + 400. From here we find that the full hours value is 1. Next, the remaining 400 seconds are equal to 60×6 + 40. From here, there are 6 full minutes and 40 more remaining seconds. Thus, we find that 4000 seconds in human time 1 hour, 6 minutes, and 40 seconds. By default, the program outputs the clock time in a padded HH:MM:SS format (i.e. 01:06:40) but you can also disable the padding option and get just H:M:S (i.e. 1:6:40). Timeabulous!',
  component: lazy(() => import('./index'))
});
