import { Box } from '@mui/material';
import { useState } from 'react';
import ToolContent from '@components/ToolContent';
import ToolTextResult from '@components/result/ToolTextResult';
import SelectWithDesc from '@components/options/SelectWithDesc';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { useTranslation } from 'react-i18next';
import {
  DATE_WEEKDAY_ERRORS,
  formatMatchingYearsResult,
  parseAndFindMatchingYears,
  MAX_DAY_BY_MONTH
} from './service';
import { InitialValuesType, Weekday } from './types';

const initialValues: InitialValuesType = {
  month: '7',
  day: '23',
  weekday: 'friday',
  startYear: '2000',
  endYear: '2050'
};

const MONTH_VALUES = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12'
] as const;

const getDayOptions = (month: string) => {
  const maxDay = MAX_DAY_BY_MONTH[Number(month) - 1] ?? 31;

  return Array.from({ length: maxDay }, (_, index) => {
    const day = String(index + 1);
    return { value: day, label: day };
  });
};

const WEEKDAY_VALUES: Weekday[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

const ERROR_I18N_KEYS = {
  [DATE_WEEKDAY_ERRORS.INVALID_MONTH]:
    'dateWeekdayCalculator.errors.invalidMonth',
  [DATE_WEEKDAY_ERRORS.INVALID_DAY]: 'dateWeekdayCalculator.errors.invalidDay',
  [DATE_WEEKDAY_ERRORS.INVALID_DATE]:
    'dateWeekdayCalculator.errors.invalidDate',
  [DATE_WEEKDAY_ERRORS.INVALID_WEEKDAY]:
    'dateWeekdayCalculator.errors.invalidWeekday',
  [DATE_WEEKDAY_ERRORS.INVALID_YEAR]:
    'dateWeekdayCalculator.errors.invalidYear',
  [DATE_WEEKDAY_ERRORS.INVALID_YEAR_RANGE]:
    'dateWeekdayCalculator.errors.invalidYearRange',
  [DATE_WEEKDAY_ERRORS.EMPTY_INPUT]: 'dateWeekdayCalculator.errors.emptyInput'
} as const;

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'July 23 on Friday',
    description:
      'Find every year between 2000 and 2050 where July 23 falls on a Friday.',
    sampleOptions: {
      month: '7',
      day: '23',
      weekday: 'friday',
      startYear: '2000',
      endYear: '2050'
    },
    sampleResult: `Found 7 matching years

Friday, July 23, 2004
Friday, July 23, 2010
Friday, July 23, 2021
Friday, July 23, 2027
Friday, July 23, 2032
Friday, July 23, 2038
Friday, July 23, 2049`
  },
  {
    title: 'Leap day on Monday',
    description:
      'Find leap days (February 29) that fall on a Monday between 2000 and 2100. Non-leap years are skipped automatically.',
    sampleOptions: {
      month: '2',
      day: '29',
      weekday: 'monday',
      startYear: '2000',
      endYear: '2100'
    },
    sampleResult: `Found 3 matching years

Monday, February 29, 2016
Monday, February 29, 2044
Monday, February 29, 2072`
  },
  {
    title: 'Single-year range',
    description: 'Check whether a specific year matches the selected weekday.',
    sampleOptions: {
      month: '7',
      day: '23',
      weekday: 'friday',
      startYear: '2021',
      endYear: '2021'
    },
    sampleResult: `Found 1 matching year

Friday, July 23, 2021`
  }
];

export default function DateWeekdayCalculator({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation('time');
  const [result, setResult] = useState('');

  const monthOptions = MONTH_VALUES.map((value) => ({
    value,
    label: t(`dateWeekdayCalculator.months.${value}`)
  }));

  const weekdayOptions = WEEKDAY_VALUES.map((value) => ({
    value,
    label: t(`dateWeekdayCalculator.weekdays.${value}`)
  }));

  return (
    <ToolContent
      title={title}
      inputComponent={null}
      resultComponent={
        <ToolTextResult
          title={t('dateWeekdayCalculator.resultTitle')}
          value={result}
        />
      }
      initialValues={initialValues}
      exampleCards={exampleCards}
      toolInfo={{
        title: t('dateWeekdayCalculator.toolInfo.title', { title }),
        description: longDescription
      }}
      getGroups={({ values, updateField }) => {
        const dayOptions = getDayOptions(values.month);

        return [
          {
            title: t('dateWeekdayCalculator.dateSelection'),
            component: (
              <Box>
                <SelectWithDesc
                  description={t('dateWeekdayCalculator.monthDescription')}
                  selected={values.month}
                  onChange={(value) => {
                    updateField('month', value);

                    // Clamp the selected day down if it no longer fits
                    // the newly selected month (e.g. switching from
                    // January 31 to February should land on 29, not
                    // leave an out-of-range day selected).
                    const newMaxDay = MAX_DAY_BY_MONTH[Number(value) - 1];
                    if (newMaxDay && Number(values.day) > newMaxDay) {
                      updateField('day', String(newMaxDay));
                    }
                  }}
                  options={monthOptions}
                />
                <SelectWithDesc
                  description={t('dateWeekdayCalculator.dayDescription')}
                  selected={values.day}
                  onChange={(value) => updateField('day', value)}
                  options={dayOptions}
                />
              </Box>
            )
          },
          {
            title: t('dateWeekdayCalculator.weekdaySelection'),
            component: (
              <SelectWithDesc
                description={t('dateWeekdayCalculator.weekdayDescription')}
                selected={values.weekday}
                onChange={(value) => updateField('weekday', value)}
                options={weekdayOptions}
              />
            )
          },
          {
            title: t('dateWeekdayCalculator.yearRange'),
            component: (
              <Box>
                <TextFieldWithDesc
                  description={t('dateWeekdayCalculator.startYearDescription')}
                  value={values.startYear}
                  onOwnChange={(value) => updateField('startYear', value)}
                  type="number"
                />
                <TextFieldWithDesc
                  description={t('dateWeekdayCalculator.endYearDescription')}
                  value={values.endYear}
                  onOwnChange={(value) => updateField('endYear', value)}
                  type="number"
                />
              </Box>
            )
          }
        ];
      }}
      compute={(values) => {
        try {
          const matches = parseAndFindMatchingYears(values);
          setResult(
            formatMatchingYearsResult(matches, {
              noMatches: t('dateWeekdayCalculator.noMatches'),
              foundMatches: (count) =>
                t('dateWeekdayCalculator.foundMatches', { count })
            })
          );
        } catch (error) {
          if (!(error instanceof Error)) {
            setResult(t('dateWeekdayCalculator.errors.fallback'));
            return;
          }

          const key =
            ERROR_I18N_KEYS[error.message as keyof typeof ERROR_I18N_KEYS];
          setResult(key ? t(key) : t('dateWeekdayCalculator.errors.fallback'));
        }
      }}
    />
  );
}
