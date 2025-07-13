import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import { CardExampleType } from '@components/examples/ToolExamples';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import { convertSecondsToTime } from './service';
import { useTranslation } from 'react-i18next';

const initialValues = {
  paddingFlag: false
};
type InitialValuesType = typeof initialValues;
const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: '1 Second, 1 Minute, 1 Hour',
    description:
      "In this example, we convert 1 second, 60 seconds, and 3600 seconds to clock format. We don't use the zero-padding option and get three simple output values – 0:0:1 for 1 second, 0:1:0 for 60 seconds (1 minute), and 1:0:0 for 3600 seconds (1 hour).",
    sampleText: `1
60
3600`,
    sampleResult: `0:0:1
0:1:0
1:0:0`,
    sampleOptions: { paddingFlag: false }
  },
  {
    title: 'HH:MM:SS Digital Clock',
    description:
      "In this example, we enable the padding option and output digital clock time in the format HH:MM:SS. The first two integer timestamps don't contain a full minute and the third timestamp doesn't contain a full hour, there we get zeros in the minutes or hours positions in output.",
    sampleText: `0
46
890
18305
40271
86399`,
    sampleResult: `00:00:00
00:00:46
00:14:50
05:05:05
11:11:11
23:59:59`,
    sampleOptions: { paddingFlag: true }
  },
  {
    title: 'More Than a Day',
    description:
      "The values of all input seconds in this example are greater than the number of seconds in a day (86400 seconds). As our algorithm doesn't limit the time to just 23:59:59 hours, it can find the exact number of hours in large inputs.",
    sampleText: `86401
123456
2159999

3600000
101010101`,
    sampleResult: `24:00:01
34:17:36
599:59:59

1000:00:00
28058:21:41`,
    sampleOptions: { paddingFlag: true }
  }
];

export default function SecondsToTime({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (optionsValues: typeof initialValues, input: string) => {
    setResult(convertSecondsToTime(input, optionsValues.paddingFlag));
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: t('time.convertSecondsToTime.timePadding'),
      component: (
        <Box>
          <CheckboxWithDesc
            onChange={(val) => updateField('paddingFlag', val)}
            checked={values.paddingFlag}
            title={t('time.convertSecondsToTime.addPadding')}
            description={t('time.convertSecondsToTime.addPaddingDescription')}
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
        title: t('time.convertSecondsToTime.toolInfo.title', { title }),
        description: longDescription
      }}
      exampleCards={exampleCards}
    />
  );
}
