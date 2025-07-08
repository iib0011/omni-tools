import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { CardExampleType } from '@components/examples/ToolExamples';
import { convertDateToEpoch } from './service';

const initialValues = {};
type InitialValuesType = typeof initialValues;

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'ISO 8601 Dates',
    description:
      'Convert standard ISO 8601 formatted dates to epoch timestamps. This format is commonly used in APIs and data exchange.',
    sampleText: `2023-01-01T00:00:00Z
2023-06-15T12:30:45Z
2023-12-31T23:59:59Z`,
    sampleResult: `1672531200
1686832245
1704067199`,
    sampleOptions: {}
  },
  {
    title: 'Common Date Formats',
    description:
      'Convert various common date formats including YYYY-MM-DD, MM/DD/YYYY, and DD/MM/YYYY to epoch timestamps.',
    sampleText: `2023-01-01
01/15/2023
15/06/2023
2023-12-31 18:30:00`,
    sampleResult: `1672531200
1673740800
1686787200
1703961800`,
    sampleOptions: {}
  },
  {
    title: 'Mixed Date Formats',
    description:
      'The tool automatically detects and converts various date formats in a single input, making it easy to process mixed date data.',
    sampleText: `2023-01-01T00:00:00Z
01/15/2023 14:30
2023-06-15
12/31/2023 23:59:59`,
    sampleResult: `1672531200
1673792200
1686787200
1704063599`,
    sampleOptions: {}
  },
  {
    title: 'Existing Epoch Timestamps',
    description:
      'If you input existing epoch timestamps, the tool validates them and passes them through unchanged.',
    sampleText: `1672531200
1686787200
1704067199`,
    sampleResult: `1672531200
1686787200
1704067199`,
    sampleOptions: {}
  }
];

export default function ConvertDateToEpoch({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (optionsValues: typeof initialValues, input: string) => {
    setResult(convertDateToEpoch(input));
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
      toolInfo={{ title: `What is a ${title}?`, description: longDescription }}
      exampleCards={exampleCards}
    />
  );
}
