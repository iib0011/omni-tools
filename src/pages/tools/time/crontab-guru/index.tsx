import { Box, Typography, Alert, Button, Stack } from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import { CardExampleType } from '@components/examples/ToolExamples';
import { main, validateCrontab, explainCrontab } from './service';

const initialValues = {};

type InitialValuesType = typeof initialValues;

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Every day at 16:35, Sunday to Friday',
    description: 'At 16:35 on every day-of-week from Sunday through Friday.',
    sampleText: '35 16 * * 0-5',
    sampleResult: 'At 04:35 PM, Sunday through Friday',
    sampleOptions: {}
  },
  {
    title: 'Every minute',
    description: 'Runs every minute.',
    sampleText: '* * * * *',
    sampleResult: 'Every minute',
    sampleOptions: {}
  },
  {
    title: 'Every 5 minutes',
    description: 'Runs every 5 minutes.',
    sampleText: '*/5 * * * *',
    sampleResult: 'Every 5 minutes',
    sampleOptions: {}
  },
  {
    title: 'At 12:00 PM on the 1st of every month',
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
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  const compute = (values: InitialValuesType, input: string) => {
    if (hasInteracted) {
      setIsValid(validateCrontab(input));
    }
    setResult(main(input, values));
  };

  const handleExample = (expr: string) => {
    setInput(expr);
    setHasInteracted(true);
    setIsValid(validateCrontab(expr));
    setResult(main(expr, initialValues));
  };

  const handleInputChange = (val: string) => {
    if (!hasInteracted) setHasInteracted(true);
    setInput(val);
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = () => [];

  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <>
          <ToolTextInput
            value={input}
            onChange={handleInputChange}
            placeholder="e.g. 35 16 * * 0-5"
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
        <div style={{ position: 'relative', minHeight: 80 }}>
          {hasInteracted && isValid === false && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 2,
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent'
              }}
            >
              <Alert
                severity="error"
                style={{
                  width: '80%',
                  opacity: 0.85,
                  textAlign: 'center',
                  pointerEvents: 'none'
                }}
              >
                Invalid crontab expression.
              </Alert>
            </div>
          )}
          <div
            style={{
              filter: hasInteracted && isValid === false ? 'blur(1px)' : 'none',
              transition: 'filter 0.2s'
            }}
          >
            <ToolTextResult
              value={hasInteracted && isValid === false ? '' : result}
            />
          </div>
        </div>
      }
      initialValues={initialValues}
      exampleCards={exampleCards}
      getGroups={getGroups}
      setInput={setInput}
      compute={compute}
      toolInfo={{ title: `What is a ${title}?`, description: longDescription }}
    />
  );
}
