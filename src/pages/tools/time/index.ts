import { tool as daysDoHours } from './convert-days-to-hours/meta';
import { tool as hoursToDays } from './convert-hours-to-days/meta';
import { tool as convertSecondsToTime } from './convert-seconds-to-time/meta';
import { tool as convertTimetoSeconds } from './convert-time-to-seconds/meta';
import { tool as truncateClockTime } from './truncate-clock-time/meta';

export const timeTools = [
  daysDoHours,
  hoursToDays,
  convertSecondsToTime,
  convertTimetoSeconds,
  truncateClockTime
];
