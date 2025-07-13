import React, { useState } from 'react';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { CardExampleType } from '@components/examples/ToolExamples';
import { validateJson } from './service';
import { ToolComponentProps } from '@tools/defineTool';
import ToolContent from '@components/ToolContent';
import { useTranslation } from 'react-i18next';

const exampleCards: CardExampleType<{}>[] = [
  {
    title: 'Valid JSON Object',
    description:
      'This example shows a correctly formatted JSON object. All property names and string values are enclosed in double quotes, and the overall structure is properly balanced with opening and closing braces.',
    sampleText: `{
  "name": "John",
  "age": 30,
  "city": "New York"
}`,
    sampleResult: '✅ Valid JSON',
    sampleOptions: {}
  },
  {
    title: 'Invalid JSON Missing Quotes',
    description:
      'This example demonstrates an invalid JSON object where the property names are not enclosed in double quotes. According to the JSON standard, property names must always be enclosed in double quotes. Omitting the quotes will result in a syntax error.',
    sampleText: `{
  name: "John",
  age: 30,
  city: "New York"
}`,
    sampleResult: "❌ Error: Expected property name or '}' in JSON",
    sampleOptions: {}
  },
  {
    title: 'Invalid JSON with Trailing Comma',
    description:
      'This example shows an invalid JSON object with a trailing comma after the last key-value pair. In JSON, trailing commas are not allowed because they create ambiguity when parsing the data structure.',
    sampleText: `{
  "name": "John",
  "age": 30,
  "city": "New York",
}`,
    sampleResult: '❌ Error: Expected double-quoted property name',
    sampleOptions: {}
  }
];

export default function ValidateJson({ title }: ToolComponentProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (options: any, input: string) => {
    const { valid, error } = validateJson(input);

    if (valid) {
      setResult(t('json:validateJson.validJson'));
    } else {
      setResult(t('json:validateJson.invalidJson', { error }));
    }
  };

  return (
    <ToolContent
      title={title}
      inputComponent={
        <ToolTextInput
          title={t('json:validateJson.inputTitle')}
          value={input}
          onChange={setInput}
        />
      }
      resultComponent={
        <ToolTextResult
          title={t('json:validateJson.resultTitle')}
          value={result}
        />
      }
      initialValues={{}}
      getGroups={null}
      toolInfo={{
        title: t('json:validateJson.toolInfo.title'),
        description: t('json:validateJson.toolInfo.description')
      }}
      exampleCards={exampleCards}
      input={input}
      setInput={setInput}
      compute={compute}
    />
  );
}
