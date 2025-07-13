import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { CardExampleType } from '@components/examples/ToolExamples';
import { convertTimetoSeconds } from './service';
import { useTranslation } from 'react-i18next';

const initialValues = {};
type InitialValuesType = typeof initialValues;
const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Multiple Clock Times',
    description:
      'In this example, we convert multiple clock times to seconds. Each clock time is listed on a new line and the spacing between input times is preserved in the output.',
    sampleText: `00:00:00

00:00:01
00:01:00
01:00:00
01:59:59
12:00:00
18:30:30
23:59:59

24:00:00`,
    sampleResult: `0

1
60
3600
7199
43200
66630
86399

86400`,
    sampleOptions: {}
  },
  {
    title: 'Partial Clock Times',
    description:
      'This example finds how many seconds there are in clock times that are partially written. Some of the clock times contain just the hours and some others contain just hours and minutes.',
    sampleText: `1
1:10
14:44
23`,
    sampleResult: `3600
4200
53040
82800`,
    sampleOptions: {}
  },
  {
    title: 'Time Beyond 24 Hours',
    description:
      'In this example, we go beyond the regular 24-hour clock. In fact, we even go beyond 60 minutes and 60 seconds.',
    sampleText: `24:00:01
48:00:00
72

00:100:00
100:100:100`,
    sampleResult: `86401
172800
259200

6000
366100`,
    sampleOptions: {}
  }
];

export default function TimeToSeconds({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation('time');
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (optionsValues: typeof initialValues, input: string) => {
    setResult(convertTimetoSeconds(input));
  };

  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={<ToolTextInput value={input} onChange={setInput} />}
      resultComponent={<ToolTextResult value={result} />}
      initialValues={initialValues}
      getGroups={null}
      setInput={setInput}
      compute={compute}
      toolInfo={{
        title: t('convertTimeToSeconds.toolInfo.title', { title }),
        description: longDescription
      }}
      exampleCards={exampleCards}
    />
  );
}
