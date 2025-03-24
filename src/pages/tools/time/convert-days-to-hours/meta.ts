import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  path: 'convert-days-to-hours',
  name: 'Convert Days to Hours',
  icon: 'ri:24-hours-line',
  description:
    'With this browser-based application, you can calculate how many hours there are in the given number of days. The application takes the input values (days), multiplies them by 24 and that converts them into hours. It supports both integer and decimal day values and it can convert multiple values at the same time.',
  shortDescription: 'Convert days to hours easily.',
  keywords: ['convert', 'days', 'hours'],
  longDescription:
    'This is a quick online utility for converting days to hours. One day is 24 hours and to convert days to hours, we simply do the multiplication operation: hours = days × 24. For example, 2 days is 2 × 24 = 48 hours and 5 days is 5 × 24 = 120 hours. You can convert not only full days to hours but also fractional day values. For example, 1.5 days is 1.5 × 24 = 36 hours and 4.6 days is 4.6 × 24 = 110.4 hours. You can enter multiple days in the input field (one value per line). In this case, they will all be computed in parallel and at once. The program also supports the postfix "days" or "d" for the input values and you can add the postfix "hours" to the output values. Timeabulous!',
  component: lazy(() => import('./index'))
});
