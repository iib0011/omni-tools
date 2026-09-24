import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { CardExampleType } from '@components/examples/ToolExamples';
import { main } from './service';

const initialValues = {};

type InitialValuesType = typeof initialValues;

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Every day at 16:35, Sunday to Friday (English)',
    description: 'At 16:35 on every day-of-week from Sunday through Friday.',
    sampleText: '35 16 * * 0-5',
    sampleResult: 'At 04:35 PM, Sunday through Friday',
    sampleOptions: {}
  },
  {
    title: 'Every minute (English)',
    description: 'Runs every minute.',
    sampleText: '* * * * *',
    sampleResult: 'Every minute',
    sampleOptions: {}
  },
  {
    title: 'Every 5 minutes (English)',
    description: 'Runs every 5 minutes.',
    sampleText: '*/5 * * * *',
    sampleResult: 'Every 5 minutes',
    sampleOptions: {}
  },
  {
    title: 'At 12:00 PM on the 1st of every month (English)',
    description: 'Runs at noon on the first day of each month.',
    sampleText: '0 12 1 * *',
    sampleResult: 'At 12:00 PM, on day 1 of the month',
    sampleOptions: {}
  }
];

export default function CrontabGuru({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (values: InitialValuesType, input: string) => {
    setResult(main(input));
  };

  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <ToolTextInput
          value={input}
          onChange={setInput}
          placeholder="e.g. 35 16 * * 0-5"
        />
      }
      resultComponent={<ToolTextResult value={result} />}
      initialValues={initialValues}
      exampleCards={exampleCards}
      getGroups={null}
      setInput={setInput}
      compute={compute}
      toolInfo={{ title: `What is a ${title}?`, description: longDescription }}
    />
  );
}
