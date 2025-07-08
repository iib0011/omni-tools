import { Box, Stack, Button, Alert } from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import { CardExampleType } from '@components/examples/ToolExamples';
import { main, epochToDate, dateToEpoch } from './service';
import { InitialValuesType } from './types';
import ValidatedToolResult from '@components/result/ValidatedToolResult';

const initialValues: InitialValuesType = {};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Epoch to Date (seconds)',
    description: 'Convert Unix timestamp (seconds) to date',
    sampleText: '1609459200',
    sampleResult: 'Fri, 01 Jan 2021 00:00:00 GMT',
    sampleOptions: {}
  },
  {
    title: 'Epoch to Date (milliseconds)',
    description: 'Convert Unix timestamp (milliseconds) to date',
    sampleText: '1609459200000',
    sampleResult: 'Fri, 01 Jan 2021 00:00:00 GMT',
    sampleOptions: {}
  },
  {
    title: 'Date to Epoch',
    description: 'Convert date string to Unix timestamp (seconds)',
    sampleText: '2021-01-01T00:00:00Z',
    sampleResult: '1609459200',
    sampleOptions: {}
  }
];

export default function EpochConverter({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const compute = (_values: InitialValuesType, input: string) => {
    let output = main(input, {});
    const invalid = output.startsWith('Invalid');
    setIsValid(!invalid);
    setResult(output);
  };

  const handleExample = (expr: string) => {
    setInput(expr);
    setHasInteracted(true);
    compute({}, expr);
  };

  const handleInputChange = (val: string) => {
    if (!hasInteracted) setHasInteracted(true);
    setInput(val);
  };

  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <>
          <ToolTextInput
            value={input}
            onChange={handleInputChange}
            placeholder="Enter epoch timestamp or date string (e.g. 1609459200 or 2021-01-01T00:00:00Z)"
          />
          <Stack direction="row" spacing={1} mt={1}>
            {exampleCards.map((ex, i) => (
              <Button
                key={i}
                size="small"
                variant="outlined"
                onClick={() => ex.sampleText && handleExample(ex.sampleText)}
                disabled={!ex.sampleText}
              >
                {ex.title}
              </Button>
            ))}
          </Stack>
        </>
      }
      resultComponent={
        <ValidatedToolResult
          isValid={isValid}
          hasInteracted={hasInteracted}
          errorMessage="Invalid input. Please enter a valid epoch timestamp or date string."
        >
          <ToolTextResult value={result} />
        </ValidatedToolResult>
      }
      initialValues={initialValues}
      exampleCards={exampleCards}
      getGroups={null}
      setInput={setInput}
      compute={compute}
      toolInfo={{ title: `What is a ${title}?`, description: longDescription }}
    />
  );
}
