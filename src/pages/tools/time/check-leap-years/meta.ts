import { defineTool } from '@tools/defineTool';
import { lazy } from 'react';

export const tool = defineTool('time', {
  path: 'check-leap-years',
  name: 'Check Leap Years',
  icon: 'arcticons:calendar-simple-29',
  description:
    ' You can check if a given calendar year is a leap year. You can enter one or many different years into the input field with one date per line and get the answer to the test question of whether the given year is a leap year.',
  shortDescription: 'Check if a year is a leap year',
  keywords: ['check', 'leap', 'years'],
  longDescription: `This is a quick online utility for testing if the given year is a leap year. Just as a reminder, a leap year has 366 days, which is one more day than a common year. This extra day is added to the month of February and it falls on February 29th. There's a simple mathematical formula for calculating if the given year is a leap year. Leap years are those years that are divisible by 4 but not divisible by 100, as well as years that are divisible by 100 and 400 simultaneously. Our algorithm checks each input year using this formula and outputs the year's status. For example, if you enter the value "2025" as input, the program will display "2025 is not a leap year.", and for the value "2028", the status will be "2028 is a leap year.". You can also enter multiple years as the input in a column and get a matching column of statuses as the output.`,
  userTypes: ['General Users', 'Students'],
  component: lazy(() => import('./index'))
});
