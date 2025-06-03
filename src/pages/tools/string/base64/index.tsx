import { useState } from 'react';
import ToolContent from '@components/ToolContent';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { base64 } from './service';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import { Box } from '@mui/material';
import SimpleRadio from '@components/options/SimpleRadio';

interface InitialValuesType {
  mode: 'encode' | 'decode';
}

const initialValues: InitialValuesType = {
  mode: 'encode'
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Encode data in UTF-8 with Base64',
    description: 'This example shows how to encode a simple text using Base64.',
    sampleText: 'Hello, World!',
    sampleResult: 'SGVsbG8sIFdvcmxkIQ==',
    sampleOptions: { mode: 'encode' }
  },
  {
    title: 'Decode Base64-encoded data to UTF-8',
    description:
      'This example shows how to decode data that was encoded with Base64.',
    sampleText: 'SGVsbG8sIFdvcmxkIQ==',
    sampleResult: 'Hello, World!',
    sampleOptions: { mode: 'decode' }
  }
];

export default function Base64({ title }: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (optionsValues: InitialValuesType, input: string) => {
    if (input) setResult(base64(input, optionsValues.mode === 'encode'));
  };

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: 'Base64 Options',
      component: (
        <Box>
          <SimpleRadio
            onClick={() => updateField('mode', 'encode')}
            checked={values.mode === 'encode'}
            title={'Base64 Encode'}
          />
          <SimpleRadio
            onClick={() => updateField('mode', 'decode')}
            checked={values.mode === 'decode'}
            title={'Base64 Decode'}
          />
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      inputComponent={
        <ToolTextInput title="Input Data" value={input} onChange={setInput} />
      }
      resultComponent={<ToolTextResult title="Result" value={result} />}
      initialValues={initialValues}
      getGroups={getGroups}
      toolInfo={{
        title: 'What is Base64?',
        description:
          'Base64 is an encoding scheme that represents data in an ASCII string format by translating it into a radix-64 representation. Although it can be used to encode strings, it is commonly used to encode binary data for transmission over media that are designed to deal with textual data.'
      }}
      exampleCards={exampleCards}
      input={input}
      setInput={setInput}
      compute={compute}
    />
  );
}
