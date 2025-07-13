import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { minifyJson } from './service';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { useTranslation } from 'react-i18next';

type InitialValuesType = Record<string, never>;

const initialValues: InitialValuesType = {};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Minify a Simple JSON Object',
    description:
      'This example shows how to minify a simple JSON object by removing all unnecessary whitespace.',
    sampleText: `{
  "name": "John Doe",
  "age": 30,
  "city": "New York"
}`,
    sampleResult: `{"name":"John Doe","age":30,"city":"New York"}`,
    sampleOptions: {}
  },
  {
    title: 'Minify a Nested JSON Structure',
    description:
      'This example demonstrates minification of a complex nested JSON structure with arrays and objects.',
    sampleText: `{
  "users": [
    {
      "id": 1,
      "name": "Alice",
      "hobbies": ["reading", "gaming"]
    },
    {
      "id": 2,
      "name": "Bob",
      "hobbies": ["swimming", "coding"]
    }
  ]
}`,
    sampleResult: `{"users":[{"id":1,"name":"Alice","hobbies":["reading","gaming"]},{"id":2,"name":"Bob","hobbies":["swimming","coding"]}]}`,
    sampleOptions: {}
  }
];

export default function MinifyJson({ title }: ToolComponentProps) {
  const { t } = useTranslation('json');
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (_: InitialValuesType, input: string) => {
    if (input) setResult(minifyJson(input));
  };

  return (
    <ToolContent
      title={title}
      inputComponent={
        <ToolTextInput
          title={t('minify.inputTitle')}
          value={input}
          onChange={setInput}
        />
      }
      resultComponent={
        <ToolTextResult
          title={t('minify.resultTitle')}
          value={result}
          extension={'json'}
        />
      }
      initialValues={initialValues}
      getGroups={null}
      toolInfo={{
        title: t('minify.toolInfo.title'),
        description: t('minify.toolInfo.description')
      }}
      exampleCards={exampleCards}
      input={input}
      setInput={setInput}
      compute={compute}
    />
  );
}
