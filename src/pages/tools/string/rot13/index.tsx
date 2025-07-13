import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { rot13 } from './service';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (_: InitialValuesType, input: string) => {
    if (input) setResult(rot13(input));
  };

  return (
    <ToolContent
      title={title}
      inputComponent={
        <ToolTextInput
          title={t('string:rot13.inputTitle')}
          value={input}
          onChange={setInput}
        />
      }
      resultComponent={
        <ToolTextResult title={t('string:rot13.resultTitle')} value={result} />
      }
      initialValues={initialValues}
      getGroups={null}
      toolInfo={{
        title: t('string:rot13.toolInfo.title'),
        description: t('string:rot13.toolInfo.description')
      }}
      exampleCards={exampleCards}
      input={input}
      setInput={setInput}
      compute={compute}
    />
  );
}
