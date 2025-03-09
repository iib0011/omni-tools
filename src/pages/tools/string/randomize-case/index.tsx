import React, { useState } from 'react';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { randomizeCase } from './service';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import ToolContent from '@components/ToolContent';

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

  const computeExternal = (
    _optionsValues: typeof initialValues,
    input: string
  ) => {
    setResult(randomizeCase(input));
  };

  return (
    <ToolContent
      title={title}
      initialValues={initialValues}
      getGroups={null}
      compute={computeExternal}
      input={input}
      setInput={setInput}
      inputComponent={<ToolTextInput value={input} onChange={setInput} />}
      resultComponent={
        <ToolTextResult title={'Randomized text'} value={result} />
      }
      exampleCards={exampleCards}
    />
  );
}
