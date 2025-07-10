import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { CardExampleType } from '@components/examples/ToolExamples';
import { GetGroupsType } from '@components/options/ToolOptions';
import { Box } from '@mui/material';
import SimpleRadio from '@components/options/SimpleRadio';
import { convertDateToEpoch, convertEpochToDate } from './service';
import { InitialValuesType } from './types';

const initialValues: InitialValuesType = {
  mode: 'dateToEpoch'
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'ISO 8601 Dates to Epoch',
    description:
      'Convert standard ISO 8601 formatted dates to epoch timestamps. This format is commonly used in APIs and data exchange.',
    sampleText: `2023-01-01T00:00:00Z
2023-06-15T12:30:45Z
2023-12-31T23:59:59Z`,
    sampleResult: `1672531200
1686832245
1704067199`,
    sampleOptions: { mode: 'dateToEpoch' }
  },
  {
    title: 'Common Date Formats to Epoch',
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
    sampleOptions: { mode: 'dateToEpoch' }
  },
  {
    title: 'Epoch to Human-Readable Dates',
    description:
      'Convert Unix epoch timestamps back to human-readable date format. The output format is YYYY-MM-DD HH:mm:ss UTC.',
    sampleText: `1672531200
1686832245
1704067199`,
    sampleResult: `2023-01-01 00:00:00 UTC
2023-06-15 12:30:45 UTC
2023-12-31 23:59:59 UTC`,
    sampleOptions: { mode: 'epochToDate' }
  },
  {
    title: 'Mixed Epoch Timestamps',
    description:
      'Convert multiple epoch timestamps from different years and times to readable dates.',
    sampleText: `0
946684800
1577836800
1735689600`,
    sampleResult: `1970-01-01 00:00:00 UTC
2000-01-01 00:00:00 UTC
2020-01-01 00:00:00 UTC
2025-01-01 00:00:00 UTC`,
    sampleOptions: { mode: 'epochToDate' }
  }
];

export default function ConvertDateToEpoch({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (optionsValues: InitialValuesType, input: string) => {
    if (optionsValues.mode === 'dateToEpoch') {
      setResult(convertDateToEpoch(input));
    } else {
      setResult(convertEpochToDate(input));
    }
  };

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: 'Conversion Mode',
      component: (
        <Box>
          <SimpleRadio
            onClick={() => updateField('mode', 'dateToEpoch')}
            checked={values.mode === 'dateToEpoch'}
            title={'Date to Epoch'}
            description={
              'Convert human-readable dates to Unix epoch timestamps'
            }
          />
          <SimpleRadio
            onClick={() => updateField('mode', 'epochToDate')}
            checked={values.mode === 'epochToDate'}
            title={'Epoch to Date'}
            description={
              'Convert Unix epoch timestamps to human-readable dates'
            }
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
