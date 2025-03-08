import { Box } from '@mui/material';
import React, { useState, useRef } from 'react';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import ToolOptions from '@components/options/ToolOptions';
import { randomizeCase } from './service';
import ToolInputAndResult from '@components/ToolInputAndResult';
import ToolExamples, {
  CardExampleType
} from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { FormikProps } from 'formik';

const initialValues = {};

const exampleCards: CardExampleType<typeof initialValues>[] = [
  {
    title: 'Randomize Text Case',
    description:
      'This example turns normal text into a random mix of uppercase and lowercase letters.',
    sampleText: 'The quick brown fox jumps over the lazy dog.',
    sampleResult: 'tHe qUIcK BrOWn fOx JuMPs ovEr ThE LaZy Dog.',
    sampleOptions: {}
  },
  {
    title: 'Randomize Code Case',
    description:
      'Transform code identifiers with randomized case for a chaotic look.',
    sampleText:
      'function calculateTotal(price, quantity) { return price * quantity; }',
    sampleResult:
      'FuNcTIon cAlCuLAtEtOtaL(pRicE, qUaNTiTy) { rETuRn PrICe * QuAnTiTY; }',
    sampleOptions: {}
  },
  {
    title: 'Randomize a Famous Quote',
    description:
      'Give a unique randomized case treatment to a well-known quote.',
    sampleText: 'To be or not to be, that is the question.',
    sampleResult: 'tO Be oR NoT To bE, ThAt iS ThE QueStIoN.',
    sampleOptions: {}
  }
];

export default function RandomizeCase({ title }: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const formRef = useRef<FormikProps<typeof initialValues>>(null);

  const computeExternal = (
    _optionsValues: typeof initialValues,
    input: string
  ) => {
    setResult(randomizeCase(input));
  };

  const getGroups = () => [];

  return (
    <Box>
      <ToolInputAndResult
        input={<ToolTextInput value={input} onChange={setInput} />}
        result={<ToolTextResult title={'Randomized text'} value={result} />}
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
