import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import { CardExampleType } from '@components/examples/ToolExamples';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { convertHoursToDays } from './service';

const initialValues = {
  daysFlag: false,
  accuracy: '1'
};
type InitialValuesType = typeof initialValues;
const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Hours to Integer Days',
    description:
      'In this example, we convert ten hour values to ten day values. Each input hour is divisible by 24 without a remainder, so all converted output values are full days. To better communicate the time units, we use the word "hours" in the input data and also add the word "days" to the output data.',
    sampleText: `24 hours
48 hours
72 hours
96 hours
120 hours
144 hours
168 hours
192 hours
216 hours
240 hours`,
    sampleResult: `1 day
2 days
3 days
4 days
5 days
6 days
7 days
8 days
9 days
10 days`,
    sampleOptions: { daysFlag: true, accuracy: '2' }
  },
  {
    title: 'Decimal Days',
    description:
      'In this example, we convert five decimal fraction day values to hours. Conversion of partial days is similar to the conversion of full days – they are all multiplied by 24. We turn off the option that appends the "hours" string after the converted values and get only the numerical hour values in the output.',
    sampleText: `1 hr
100 hr
9999 hr
12345 hr
333333 hr`,
    sampleResult: `0.0417 days
4.1667 days
416.625 days
514.375 days
13888.875 days`,
    sampleOptions: { daysFlag: true, accuracy: '4' }
  },
  {
    title: 'Partial Hours',
    description:
      'In the modern Gregorian calendar, a common year has 365 days and a leap year has 366 days. This makes the true average length of a year to be 365.242199 days. In this example, we load this number in the input field and convert it to the hours. It turns out that there 8765.812776 hours in an average year.',
    sampleText: `0.5
0.01
0.99`,
    sampleResult: `0.02083333
0.00041667
0.04125`,
    sampleOptions: { daysFlag: false, accuracy: '8' }
  }
];

export default function ConvertDaysToHours({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (optionsValues: typeof initialValues, input: string) => {
    setResult(
      convertHoursToDays(input, optionsValues.accuracy, optionsValues.daysFlag)
    );
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: 'Day Value Accuracy',
      component: (
        <Box>
          <TextFieldWithDesc
            description={
              'If the calculated days is a decimal number, then how many digits should be left after the decimal point?.'
            }
            value={values.accuracy}
            onOwnChange={(val) => updateField('accuracy', val)}
            type={'text'}
          />
        </Box>
      )
    },
    {
      title: 'Days Postfix',
      component: (
        <Box>
          <CheckboxWithDesc
            onChange={(val) => updateField('daysFlag', val)}
            checked={values.daysFlag}
            title={'Append Days Postfix'}
            description={'Display numeric day values with the postfix "days".'}
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
      toolInfo={{ title: `What is a ${title}?`, description: longDescription }}
      exampleCards={exampleCards}
    />
  );
}
