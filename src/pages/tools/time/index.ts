import { tool as timeEpochConverter } from './epoch-converter/meta';
import { tool as timeCrontabGuru } from './crontab-guru/meta';
import { tool as timeBetweenDates } from './time-between-dates/meta';
import { tool as daysDoHours } from './convert-days-to-hours/meta';
import { tool as hoursToDays } from './convert-hours-to-days/meta';
import { tool as convertSecondsToTime } from './convert-seconds-to-time/meta';
import { tool as convertTimetoSeconds } from './convert-time-to-seconds/meta';
import { tool as truncateClockTime } from './truncate-clock-time/meta';
import { tool as checkLeapYear } from './check-leap-years/meta';

export const timeTools = [
  daysDoHours,
  hoursToDays,
  convertSecondsToTime,
  convertTimetoSeconds,
  truncateClockTime,
  timeBetweenDates,
  timeEpochConverter,
  timeCrontabGuru,
  checkLeapYear
];
