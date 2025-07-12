import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  path: 'truncate-clock-time',
  name: 'Truncate Clock Time',
  icon: 'mdi:clock-remove-outline',
  description:
    'With this browser-based application, you can truncate a clock time and drop the minutes and/or seconds components from it. If you drop the seconds, you will be left with hours and minutes. For example, "13:23:45" will be truncated to "13:23". If you drop both minutes and seconds, you will be left with just hours. For example, "13:23:45" will be truncated to just "13". Additionally, in the options, you can add or remove the hours and minutes padding and also print the dropped time component as a zero if needed.',
  shortDescription: 'Quickly convert clock time in H:M:S format to seconds.',
  keywords: ['truncate', 'time', 'clock'],
  userTypes: ['General Users', 'Students'],
  component: lazy(() => import('./index'))
});
