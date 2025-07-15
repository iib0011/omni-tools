import { useState, useEffect } from 'react';
import ToolContent from '@components/ToolContent';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { compareJson } from './service';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { Box, Grid, styled } from '@mui/material';

const StyledContainer = styled(Box)({
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  minHeight: '500px',
  marginBottom: '20px'
});

const StyledGrid = styled(Grid)({
  flex: 1,
  '& .MuiGrid-item': {
    height: '100%'
  }
});

const StyledInputWrapper = styled(Box)({
  height: '100%',
  '& > div': {
    height: '100%',
    '& textarea': {
      height: '100% !important',
      minHeight: '450px',
      resize: 'none',
      fontSize: '14px',
      lineHeight: '1.5',
      padding: '12px'
    }
  }
});

type InitialValuesType = {};

const initialValues: InitialValuesType = {};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Compare Simple JSON Objects',
    description:
      'Compare two JSON objects to find differences in their structure and values.',
    sampleText: `{
  "name": "John",
  "age": 30,
  "address": {
    "city": "New York",
    "country": "USA"
  }
}`,
    sampleResult: `{
  "name": "John",
  "age": 25,
  "address": {
    "city": "London",
    "country": "UK"
  }
}`,
    sampleOptions: {
      ...initialValues
    }
  }
];

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

  const handleInput1Change = (value: string) => {
    setInput1(value);
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
      compute={() => {}}
      exampleCards={exampleCards}
      inputComponent={
        <StyledContainer>
          <StyledGrid container spacing={2}>
            <Grid item xs={4}>
              <StyledInputWrapper>
                <ToolTextInput
                  title="First JSON"
                  value={input1}
                  onChange={handleInput1Change}
                  placeholder="Paste your first JSON here..."
                />
              </StyledInputWrapper>
            </Grid>
            <Grid item xs={4}>
              <StyledInputWrapper>
                <ToolTextInput
                  title="Second JSON"
                  value={input2}
                  onChange={handleInput2Change}
                  placeholder="Paste your second JSON here..."
                />
              </StyledInputWrapper>
            </Grid>
            <Grid item xs={4}>
              <StyledInputWrapper>
                <ToolTextResult
                  title="Differences"
                  value={result}
                  extension={'txt'}
                />
              </StyledInputWrapper>
            </Grid>
          </StyledGrid>
        </StyledContainer>
      }
    />
  );
}
