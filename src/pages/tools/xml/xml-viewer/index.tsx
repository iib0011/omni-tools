import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { CardExampleType } from '@components/examples/ToolExamples';
import { prettyPrintXml } from './service';
import { InitialValuesType } from './types';

const initialValues: InitialValuesType = {};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Pretty Print XML',
    description: 'View and pretty-print a compact XML string.',
    sampleText: '<root><item>1</item><item>2</item></root>',
    sampleResult: `<root>\n  <item>1</item>\n  <item>2</item>\n</root>`,
    sampleOptions: {}
  }
];

const getGroups = () => [];

export default function XmlViewer({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (_values: InitialValuesType, input: string) => {
    setResult(prettyPrintXml(input, {}));
  };

  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <ToolTextInput
          value={input}
          onChange={setInput}
          placeholder="Paste or import XML here..."
        />
      }
      resultComponent={<ToolTextResult value={result} extension="xml" />}
      initialValues={initialValues}
      exampleCards={exampleCards}
      getGroups={getGroups}
      setInput={setInput}
      compute={compute}
      toolInfo={{ title: `What is a ${title}?`, description: longDescription }}
    />
  );
}
