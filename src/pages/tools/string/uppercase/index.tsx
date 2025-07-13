import React, { useState } from 'react';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { UppercaseInput } from './service';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import ToolContent from '@components/ToolContent';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('string');
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const computeExternal = (
    _optionsValues: typeof initialValues,
    input: string
  ) => {
    setResult(UppercaseInput(input));
  };

  return (
    <ToolContent
      title={title}
      initialValues={initialValues}
      getGroups={null}
      compute={computeExternal}
      input={input}
      setInput={setInput}
      inputComponent={
        <ToolTextInput
          title={t('uppercase.inputTitle')}
          value={input}
          onChange={setInput}
        />
      }
      resultComponent={
        <ToolTextResult title={t('uppercase.resultTitle')} value={result} />
      }
      exampleCards={exampleCards}
    />
  );
}
