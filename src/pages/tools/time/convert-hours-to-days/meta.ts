import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  path: 'convert-hours-to-days',
  name: 'Convert Hours to Days',
  icon: 'mdi:hours-24',
  description:
    'With this browser-based application, you can calculate how many days there are in the given number of hours. Given one or more hour values in the input, it converts them into days via the simple math formula: days = hours/24. It works with arbitrary large hour values and you can also customize the decimal day precision.',
  shortDescription: 'Convert hours to days easily.',
  keywords: ['convert', 'hours', 'days'],
  longDescription:
    "This is a quick online utility for converting hours to days. To figure out the number of days in the specified hours, the program divides them by 24. For example, if the input hours value is 48, then by doing 48/24, it finds that there are 2 days, or if the hours value is 120, then it's 120/24 = 5 days. If the hours value is not divisible by 24, then the number of days is displayed as a decimal number. For example, 36 hours is 36/24 = 1.5 days and 100 hours is approximately 4.167 days. You can specify the precision of the decimal fraction calculation in the options. You can also enable the option that adds the postfix 'days' to all the output values. Timeabulous!",
  component: lazy(() => import('./index'))
});
