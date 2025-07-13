import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { CardExampleType } from '@components/examples/ToolExamples';
import { validateXml } from './service';
import { InitialValuesType } from './types';
import { useTranslation } from 'react-i18next';

const initialValues: InitialValuesType = {};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Validate XML',
    description: 'Check if an XML string is well-formed.',
    sampleText: '<root><item>1</item><item>2</item></root>',
    sampleResult: 'Valid XML',
    sampleOptions: {}
  },
  {
    title: 'Invalid XML',
    description: 'Example of malformed XML.',
    sampleText: '<root><item>1</item><item>2</root>',
    sampleResult: 'Invalid XML: ...',
    sampleOptions: {}
  }
];

export default function XmlValidator({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (_values: InitialValuesType, input: string) => {
    setResult(validateXml(input, {}));
  };

  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <ToolTextInput
          value={input}
          onChange={setInput}
          placeholder={t('xml:xmlValidator.placeholder')}
        />
      }
      resultComponent={<ToolTextResult value={result} extension="txt" />}
      initialValues={initialValues}
      exampleCards={exampleCards}
      getGroups={null}
      setInput={setInput}
      compute={compute}
      toolInfo={{
        title: t('xml:xmlValidator.toolInfo.title'),
        description: t('xml:xmlValidator.toolInfo.description')
      }}
    />
  );
}
