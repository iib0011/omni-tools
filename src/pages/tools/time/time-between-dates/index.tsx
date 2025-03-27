import { Box, Typography, Paper } from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import SelectWithDesc from '@components/options/SelectWithDesc';
import {
  calculateTimeBetweenDates,
  formatTimeDifference,
  getTimeWithTimezone
} from './service';
import * as Yup from 'yup';
import { CardExampleType } from '@components/examples/ToolExamples';

type TimeUnit =
  | 'milliseconds'
  | 'seconds'
  | 'minutes'
  | 'hours'
  | 'days'
  | 'months'
  | 'years';

type InitialValuesType = {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  startTimezone: string;
  endTimezone: string;
};

// Helper function to format time based on largest unit
const formatTimeWithLargestUnit = (
  difference: any,
  largestUnit: TimeUnit
): string => {
  const unitHierarchy: TimeUnit[] = [
    'years',
    'months',
    'days',
    'hours',
    'minutes',
    'seconds',
    'milliseconds'
  ];

  const largestUnitIndex = unitHierarchy.indexOf(largestUnit);
  const unitsToInclude = unitHierarchy.slice(largestUnitIndex);

  // Make a deep copy of the difference object to avoid modifying the original
  const convertedDifference = { ...difference };

  // Constants for time conversions - more precise values
  const HOURS_PER_DAY = 24;
  const DAYS_PER_MONTH = 30; // Approximation
  const MONTHS_PER_YEAR = 12;
  const DAYS_PER_YEAR = 365; // Approximation
  const MINUTES_PER_HOUR = 60;
  const SECONDS_PER_MINUTE = 60;
  const MS_PER_SECOND = 1000;

  // Apply conversions based on the selected largest unit
  if (largestUnit === 'months') {
    // Convert years to months
    convertedDifference.months += convertedDifference.years * MONTHS_PER_YEAR;
    convertedDifference.years = 0;
  } else if (largestUnit === 'days') {
    // Convert years and months to days
    convertedDifference.days +=
      convertedDifference.years * DAYS_PER_YEAR +
      convertedDifference.months * DAYS_PER_MONTH;
    convertedDifference.months = 0;
    convertedDifference.years = 0;
  } else if (largestUnit === 'hours') {
    // Convert years, months, and days to hours
    convertedDifference.hours +=
      convertedDifference.years * DAYS_PER_YEAR * HOURS_PER_DAY +
      convertedDifference.months * DAYS_PER_MONTH * HOURS_PER_DAY +
      convertedDifference.days * HOURS_PER_DAY;
    convertedDifference.days = 0;
    convertedDifference.months = 0;
    convertedDifference.years = 0;
  } else if (largestUnit === 'minutes') {
    // Convert years, months, days, and hours to minutes
    convertedDifference.minutes +=
      convertedDifference.years *
        DAYS_PER_YEAR *
        HOURS_PER_DAY *
        MINUTES_PER_HOUR +
      convertedDifference.months *
        DAYS_PER_MONTH *
        HOURS_PER_DAY *
        MINUTES_PER_HOUR +
      convertedDifference.days * HOURS_PER_DAY * MINUTES_PER_HOUR +
      convertedDifference.hours * MINUTES_PER_HOUR;
    convertedDifference.hours = 0;
    convertedDifference.days = 0;
    convertedDifference.months = 0;
    convertedDifference.years = 0;
  } else if (largestUnit === 'seconds') {
    // Convert years, months, days, hours, and minutes to seconds
    convertedDifference.seconds +=
      convertedDifference.years *
        DAYS_PER_YEAR *
        HOURS_PER_DAY *
        MINUTES_PER_HOUR *
        SECONDS_PER_MINUTE +
      convertedDifference.months *
        DAYS_PER_MONTH *
        HOURS_PER_DAY *
        MINUTES_PER_HOUR *
        SECONDS_PER_MINUTE +
      convertedDifference.days *
        HOURS_PER_DAY *
        MINUTES_PER_HOUR *
        SECONDS_PER_MINUTE +
      convertedDifference.hours * MINUTES_PER_HOUR * SECONDS_PER_MINUTE +
      convertedDifference.minutes * SECONDS_PER_MINUTE;
    convertedDifference.minutes = 0;
    convertedDifference.hours = 0;
    convertedDifference.days = 0;
    convertedDifference.months = 0;
    convertedDifference.years = 0;
  } else if (largestUnit === 'milliseconds') {
    // Convert everything to milliseconds
    convertedDifference.milliseconds +=
      convertedDifference.years *
        DAYS_PER_YEAR *
        HOURS_PER_DAY *
        MINUTES_PER_HOUR *
        SECONDS_PER_MINUTE *
        MS_PER_SECOND +
      convertedDifference.months *
        DAYS_PER_MONTH *
        HOURS_PER_DAY *
        MINUTES_PER_HOUR *
        SECONDS_PER_MINUTE *
        MS_PER_SECOND +
      convertedDifference.days *
        HOURS_PER_DAY *
        MINUTES_PER_HOUR *
        SECONDS_PER_MINUTE *
        MS_PER_SECOND +
      convertedDifference.hours *
        MINUTES_PER_HOUR *
        SECONDS_PER_MINUTE *
        MS_PER_SECOND +
      convertedDifference.minutes * SECONDS_PER_MINUTE * MS_PER_SECOND +
      convertedDifference.seconds * MS_PER_SECOND;
    convertedDifference.seconds = 0;
    convertedDifference.minutes = 0;
    convertedDifference.hours = 0;
    convertedDifference.days = 0;
    convertedDifference.months = 0;
    convertedDifference.years = 0;
  }

  return formatTimeDifference(convertedDifference, unitsToInclude);
};

const initialValues: InitialValuesType = {
  startDate: new Date().toISOString().split('T')[0],
  startTime: '00:00',
  endDate: new Date().toISOString().split('T')[0],
  endTime: '12:00',
  startTimezone: 'local',
  endTimezone: 'local'
};

const validationSchema = Yup.object({
  startDate: Yup.string().required('Start date is required'),
  startTime: Yup.string().required('Start time is required'),
  endDate: Yup.string().required('End date is required'),
  endTime: Yup.string().required('End time is required'),
  startTimezone: Yup.string(),
  endTimezone: Yup.string()
});

const timezoneOptions = [
  { value: 'local', label: 'Local Time' },
  { value: 'GMT+0000', label: 'GMT+0000 (UTC)' },
  { value: 'GMT-0500', label: 'GMT-0500 (Eastern Standard Time)' },
  { value: 'GMT-0600', label: 'GMT-0600 (Central Standard Time)' },
  { value: 'GMT-0700', label: 'GMT-0700 (Mountain Standard Time)' },
  { value: 'GMT-0800', label: 'GMT-0800 (Pacific Standard Time)' },
  { value: 'GMT+0100', label: 'GMT+0100 (Central European Time)' },
  { value: 'GMT+0200', label: 'GMT+0200 (Eastern European Time)' },
  { value: 'GMT+0530', label: 'GMT+0530 (Indian Standard Time)' },
  { value: 'GMT+0800', label: 'GMT+0800 (China Standard Time)' },
  { value: 'GMT+0900', label: 'GMT+0900 (Japan Standard Time)' },
  { value: 'GMT+1000', label: 'GMT+1000 (Australian Eastern Standard Time)' }
];

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'One Year Difference',
    description: 'Calculate the time between dates that are one year apart',
    sampleOptions: {
      startDate: '2023-01-01',
      startTime: '12:00',
      endDate: '2024-01-01',
      endTime: '12:00',
      startTimezone: 'local',
      endTimezone: 'local'
    },
    sampleResult: '1 year'
  },
  {
    title: 'Different Timezones',
    description: 'Calculate the time difference between New York and London',
    sampleOptions: {
      startDate: '2023-01-01',
      startTime: '12:00',
      endDate: '2023-01-01',
      endTime: '12:00',
      startTimezone: 'GMT-0500',
      endTimezone: 'GMT+0000'
    },
    sampleResult: '5 hours'
  },
  {
    title: 'Detailed Time Breakdown',
    description: 'Show a detailed breakdown of a time difference',
    sampleOptions: {
      startDate: '2023-01-01',
      startTime: '09:30',
      endDate: '2023-01-03',
      endTime: '14:45',
      startTimezone: 'local',
      endTimezone: 'local'
    },
    sampleResult: '2 days, 5 hours, 15 minutes'
  }
];

export default function TimeBetweenDates() {
  const [result, setResult] = useState<string>('');

  return (
    <ToolContent
      inputComponent={null}
      resultComponent={
        result ? (
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderLeft: '5px solid',
              borderColor: 'primary.main',
              bgcolor: 'background.paper',
              maxWidth: '100%',
              mx: 'auto'
            }}
          >
            <Typography
              variant="h4"
              align="center"
              sx={{ fontWeight: 'bold', color: 'primary.main' }}
            >
              {result}
            </Typography>
          </Paper>
        ) : null
      }
      initialValues={initialValues}
      validationSchema={validationSchema}
      exampleCards={exampleCards}
      toolInfo={{
        title: 'Time Between Dates Calculator',
        description:
          'Calculate the exact time difference between two dates and times, with support for different timezones. This tool provides a detailed breakdown of the time difference in various units (years, months, days, hours, minutes, and seconds).'
      }}
      getGroups={({ values, updateField }) => [
        {
          title: 'Start Date & Time',
          component: (
            <Box>
              <TextFieldWithDesc
                description="Start Date"
                value={values.startDate}
                onOwnChange={(val) => updateField('startDate', val)}
                type="date"
              />
              <TextFieldWithDesc
                description="Start Time"
                value={values.startTime}
                onOwnChange={(val) => updateField('startTime', val)}
                type="time"
              />
              <SelectWithDesc
                description="Start Timezone"
                selected={values.startTimezone}
                onChange={(val: string) => updateField('startTimezone', val)}
                options={timezoneOptions}
              />
            </Box>
          )
        },
        {
          title: 'End Date & Time',
          component: (
            <Box>
              <TextFieldWithDesc
                description="End Date"
                value={values.endDate}
                onOwnChange={(val) => updateField('endDate', val)}
                type="date"
              />
              <TextFieldWithDesc
                description="End Time"
                value={values.endTime}
                onOwnChange={(val) => updateField('endTime', val)}
                type="time"
              />
              <SelectWithDesc
                description="End Timezone"
                selected={values.endTimezone}
                onChange={(val: string) => updateField('endTimezone', val)}
                options={timezoneOptions}
              />
            </Box>
          )
        }
      ]}
      compute={(values) => {
        try {
          // Create Date objects with timezone consideration
          const startDateTime = getTimeWithTimezone(
            values.startDate,
            values.startTime,
            values.startTimezone
          );

          const endDateTime = getTimeWithTimezone(
            values.endDate,
            values.endTime,
            values.endTimezone
          );

          // Calculate time difference
          const difference = calculateTimeBetweenDates(
            startDateTime,
            endDateTime
          );

          // Format the result - use 'years' as the default largest unit
          if (typeof difference === 'number') {
            setResult(`${difference} milliseconds`);
          } else {
            // Auto-determine the best unit to display based on the time difference
            let bestUnit: TimeUnit = 'years';

            if (difference.years > 0) {
              bestUnit = 'years';
            } else if (difference.months > 0) {
              bestUnit = 'months';
            } else if (difference.days > 0) {
              bestUnit = 'days';
            } else if (difference.hours > 0) {
              bestUnit = 'hours';
            } else if (difference.minutes > 0) {
              bestUnit = 'minutes';
            } else if (difference.seconds > 0) {
              bestUnit = 'seconds';
            } else {
              bestUnit = 'milliseconds';
            }

            const formattedDifference = formatTimeWithLargestUnit(
              difference,
              bestUnit
            );

            setResult(formattedDifference);
          }
        } catch (error) {
          setResult(
            `Error: ${
              error instanceof Error
                ? error.message
                : 'Failed to calculate time difference'
            }`
          );
        }
      }}
    />
  );
}
