import { Box } from '@mui/material';
import React, { useState, useRef } from 'react';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import ToolOptions from '@components/options/ToolOptions';
import { UppercaseInput } from './service';
import ToolInputAndResult from '@components/ToolInputAndResult';
import ToolExamples, {
  CardExampleType
} from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { FormikProps } from 'formik';

const initialValues = {};

const exampleCards: CardExampleType<typeof initialValues>[] = [
  {
    title: 'Convert Text to Uppercase',
    description: 'This example transforms any text to ALL UPPERCASE format.',
    sampleText: 'The quick brown fox jumps over the lazy dog.',
    sampleResult: 'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG.',
    sampleOptions: {}
  },
  {
    title: 'Uppercase Code',
    description:
      'Convert code to uppercase format. Note that this is for display only and would not maintain code functionality.',
    sampleText: 'function example() { return "hello world"; }',
    sampleResult: 'FUNCTION EXAMPLE() { RETURN "HELLO WORLD"; }',
    sampleOptions: {}
  },
  {
    title: 'Mixed Case to Uppercase',
    description:
      'Transform text with mixed casing to consistent all uppercase format.',
    sampleText: 'ThIs Is MiXeD CaSe TeXt!',
    sampleResult: 'THIS IS MIXED CASE TEXT!',
    sampleOptions: {}
  }
];

export default function Uppercase({ title }: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const formRef = useRef<FormikProps<typeof initialValues>>(null);

  const computeExternal = (
    _optionsValues: typeof initialValues,
    input: string
  ) => {
    setResult(UppercaseInput(input));
  };

  const getGroups = () => [];

  return (
    <Box>
      <ToolInputAndResult
        input={<ToolTextInput value={input} onChange={setInput} />}
        result={<ToolTextResult title={'Uppercase text'} value={result} />}
      />
      <ToolOptions
        compute={computeExternal}
        getGroups={getGroups}
        initialValues={initialValues}
        input={input}
      />
      <ToolExamples
        title={title}
        exampleCards={exampleCards}
        getGroups={getGroups}
        formRef={formRef}
        setInput={setInput}
      />
    </Box>
  );
}
