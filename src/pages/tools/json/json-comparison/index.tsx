import { useEffect, useState } from 'react';
import ToolContent from '@components/ToolContent';
import ToolCodeInput from '@components/input/ToolCodeInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { compareJson } from './service';
import { ToolComponentProps } from '@tools/defineTool';
import { Grid } from '@mui/material';

type InitialValuesType = {};

const initialValues: InitialValuesType = {};

export default function JsonComparison({ title }: ToolComponentProps) {
  const [input1, setInput1] = useState<string>('');
  const [input2, setInput2] = useState<string>('');
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    const compareInputs = () => {
      try {
        // Only compare if at least one input has content
        if (input1.trim() || input2.trim()) {
          const differences = compareJson(
            input1 || '{}',
            input2 || '{}',
            'text'
          );
          setResult(differences);
        } else {
          setResult('');
        }
      } catch (error) {
        setResult(
          `Error: ${
            error instanceof Error ? error.message : 'Invalid JSON format'
          }`
        );
      }
    };

    compareInputs();
  }, [input1, input2]);

  const handleInput1Change = (value: string | undefined) => {
    setInput1(value ?? '');
  };

  const handleInput2Change = (value: string) => {
    setInput2(value);
  };

  return (
    <ToolContent
      title={title}
      input={input1}
      setInput={setInput1}
      initialValues={initialValues}
      getGroups={null}
      compute={() => {}}
      inputComponent={
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} lg={4}>
            <ToolCodeInput
              title="First JSON"
              value={input1}
              onChange={handleInput1Change}
              language={'json'}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <ToolCodeInput
              title="Second JSON"
              language={'json'}
              value={input2}
              onChange={handleInput2Change}
            />
          </Grid>
          <Grid item xs={12} md={12} lg={4}>
            <ToolTextResult
              title="Differences"
              value={result}
              extension={'txt'}
            />
          </Grid>
        </Grid>
      }
    />
  );
}
