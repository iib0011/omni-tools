import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import { CardExampleType } from '@components/examples/ToolExamples';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import { convertDaysToHours } from './service';
import { useTranslation } from 'react-i18next';

const initialValues = {
  hoursFlag: false
};
type InitialValuesType = typeof initialValues;
const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Full Days to Hours',
    description:
      'This example calculates how many hours there are in 1 day, in one week (7 days), in one month (30 days), and in even longer time periods. To see all the results at once, we enter each individual day value on a new line. We also use the "days" suffix in the input and add the "hours" suffix to the output.',
    sampleText: `1 day 
7 days
30 days
90 days
125 days
500 days`,
    sampleResult: `24 hours
168 hours
720 hours
2160 hours
3000 hours
12000 hours`,
    sampleOptions: { hoursFlag: true }
  },
  {
    title: 'Fractional Days to Hours',
    description:
      'In this example, we convert five decimal fraction day values to hours. Conversion of partial days is similar to the conversion of full days – they are all multiplied by 24. We turn off the option that appends the "hours" string after the converted values and get only the numerical hour values in the output.',
    sampleText: `0.2 d
1.5 days
25.25
9.999
350.401`,
    sampleResult: `4.8
36
606
239.976
8409.624`,
    sampleOptions: { hoursFlag: false }
  },
  {
    title: 'Number of Hours in a Year',
    description:
      'In the modern Gregorian calendar, a common year has 365 days and a leap year has 366 days. This makes the true average length of a year to be 365.242199 days. In this example, we load this number in the input field and convert it to the hours. It turns out that there 8765.812776 hours in an average year.',
    sampleText: `365.242199 days`,
    sampleResult: `8765.812776 hours`,
    sampleOptions: { hoursFlag: true }
  }
];

export default function ConvertDaysToHours({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (optionsValues: typeof initialValues, input: string) => {
    setResult(convertDaysToHours(input, optionsValues.hoursFlag));
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: t('time.convertDaysToHours.hoursName'),
      component: (
        <Box>
          <CheckboxWithDesc
            onChange={(val) => updateField('hoursFlag', val)}
            checked={values.hoursFlag}
            title={t('time.convertDaysToHours.addHoursName')}
            description={t('time.convertDaysToHours.addHoursNameDescription')}
          />
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={<ToolTextInput value={input} onChange={setInput} />}
      resultComponent={<ToolTextResult value={result} />}
      initialValues={initialValues}
      getGroups={getGroups}
      setInput={setInput}
      compute={compute}
      toolInfo={{
        title: t('time.convertDaysToHours.toolInfo.title'),
        description: t('time.convertDaysToHours.toolInfo.description')
      }}
      exampleCards={exampleCards}
    />
  );
}
