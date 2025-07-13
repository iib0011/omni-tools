import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  path: 'truncate-clock-time',
  name: 'Truncate Clock Time',
  icon: 'mdi:clock-remove-outline',
  description:
    'With this browser-based application, you can truncate a clock time and drop the minutes and/or seconds components from it. If you drop the seconds, you will be left with hours and minutes. For example, "13:23:45" will be truncated to "13:23". If you drop both minutes and seconds, you will be left with just hours. For example, "13:23:45" will be truncated to just "13". Additionally, in the options, you can add or remove the hours and minutes padding and also print the dropped time component as a zero if needed.',
  shortDescription: 'Quickly drop the minutes and/or seconds components from clock time.',
  keywords: ['truncate', 'time', 'clock'],
  longDescription:
    'This is a quick online utility for truncating the given clock times or timer values. It allows you to get rid of the least significant time components such as seconds and minutes. For example, if you have an exact time of "09:45:37" and you are ok working with a less precise time that has just hours and minutes, then you can discard the seconds and get "09:45". Similarly, if you only need the hours in the output, then you can truncate the minutes as well and get "09". In general, if you have a clock time "hh:mm:ss", then removing the seconds will leave "hh:mm" and removing both minutes and seconds will leave just "hh". The program can truncate as many clock times as you need – just enter them one per line in the input and the truncation result will be printed in the output where you can easily copy it from. By default, the truncated parts of the time are not displayed, but if necessary, you can print them as zeros. For example, if you drop minutes and seconds from "09:45:37" and you enable zero component printing, then the output will be "09:00:00". Finally, you can control the digit width of the clock display. For example, the time "09:00:00" has full zero-padding (the width is two digits for each time component) but if the padding is removed, then it will be shown as "9:0:0" (the width now is one digit). Timeabulous!',
  component: lazy(() => import('./index'))
});
