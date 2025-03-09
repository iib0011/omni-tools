import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { rot13 } from './service';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';

type InitialValuesType = Record<string, never>;

const initialValues: InitialValuesType = {};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Encode a message with ROT13',
    description:
      'This example shows how to encode a simple message using ROT13 cipher.',
    sampleText: 'Hello, World!',
    sampleResult: 'Uryyb, Jbeyq!',
    sampleOptions: {}
  },
  {
    title: 'Decode a ROT13 message',
    description:
      'This example shows how to decode a message that was encoded with ROT13.',
    sampleText: 'Uryyb, Jbeyq!',
    sampleResult: 'Hello, World!',
    sampleOptions: {}
  }
];

export default function Rot13({ title }: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (_: InitialValuesType, input: string) => {
    if (input) setResult(rot13(input));
  };

  return (
    <ToolContent
      title={title}
      inputComponent={
        <ToolTextInput title="Input Text" value={input} onChange={setInput} />
      }
      resultComponent={<ToolTextResult title="ROT13 Result" value={result} />}
      initialValues={initialValues}
      getGroups={null}
      toolInfo={{
        title: 'What Is ROT13?',
        description:
          'ROT13 (rotate by 13 places) is a simple letter substitution cipher that replaces a letter with the 13th letter after it in the alphabet. ROT13 is a special case of the Caesar cipher which was developed in ancient Rome. Because there are 26 letters in the English alphabet, ROT13 is its own inverse; that is, to undo ROT13, the same algorithm is applied, so the same action can be used for encoding and decoding.'
      }}
      exampleCards={exampleCards}
      input={input}
      setInput={setInput}
      compute={compute}
    />
  );
}
