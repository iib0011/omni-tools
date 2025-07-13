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
import { InitialValuesType } from './types';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
      title: t('string.base64.optionsTitle'),
      component: (
        <Box>
          <SimpleRadio
            onClick={() => updateField('mode', 'encode')}
            checked={values.mode === 'encode'}
            title={t('string.base64.encode')}
          />
          <SimpleRadio
            onClick={() => updateField('mode', 'decode')}
            checked={values.mode === 'decode'}
            title={t('string.base64.decode')}
          />
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      inputComponent={
        <ToolTextInput
          title={t('string.base64.inputTitle')}
          value={input}
          onChange={setInput}
        />
      }
      resultComponent={
        <ToolTextResult title={t('string.base64.resultTitle')} value={result} />
      }
      initialValues={initialValues}
      getGroups={getGroups}
      toolInfo={{
        title: t('string.base64.toolInfo.title'),
        description: t('string.base64.toolInfo.description')
      }}
      exampleCards={exampleCards}
      input={input}
      setInput={setInput}
      compute={compute}
    />
  );
}
