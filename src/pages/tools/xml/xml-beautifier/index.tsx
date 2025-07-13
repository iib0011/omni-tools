import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { CardExampleType } from '@components/examples/ToolExamples';
import { beautifyXml } from './service';
import { InitialValuesType } from './types';
import { useTranslation } from 'react-i18next';

const initialValues: InitialValuesType = {};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Beautify XML',
    description: 'Beautify a compact XML string for readability.',
    sampleText: '<root><item>1</item><item>2</item></root>',
    sampleResult: `<root>\n  <item>1</item>\n  <item>2</item>\n</root>`,
    sampleOptions: {}
  }
];

export default function XmlBeautifier({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (_values: InitialValuesType, input: string) => {
    setResult(beautifyXml(input, {}));
  };

  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <ToolTextInput
          title={t('xml.beautifier.inputTitle')}
          value={input}
          onChange={setInput}
          placeholder={t('xml.beautifier.placeholder')}
        />
      }
      resultComponent={
        <ToolTextResult
          title={t('xml.beautifier.resultTitle')}
          value={result}
          extension="xml"
        />
      }
      initialValues={initialValues}
      exampleCards={exampleCards}
      getGroups={null}
      setInput={setInput}
      compute={compute}
      toolInfo={{
        title: t('xml.beautifier.toolInfo.title', { title }),
        description: longDescription
      }}
    />
  );
}
