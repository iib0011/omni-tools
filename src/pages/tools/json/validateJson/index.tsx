import { Box } from '@mui/material';
import React, { useRef, useState, useEffect } from 'react';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import ToolInputAndResult from '@components/ToolInputAndResult';
import ToolInfo from '@components/ToolInfo';
import Separator from '@components/Separator';
import ToolExamples, {
  CardExampleType
} from '@components/examples/ToolExamples';
import { FormikProps } from 'formik';
import { validateJson } from './servcie';
import { ToolComponentProps } from '@tools/defineTool';

const exampleCards: CardExampleType<{}>[] = [
  {
    title: 'Valid JSON Object',
    description: 'This example shows a correctly formatted JSON object.',
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
      'This example shows an invalid JSON structure where property names are missing quotes.',
    sampleText: `{
  name: "John",
  age: 30,
  city: "New York"
}`,
    sampleResult: "❌ Error: Expected property name or '}' in JSON ",
    sampleOptions: {}
  },
  {
    title: 'Invalid JSON with Trailing Comma',
    description:
      'This example shows an invalid JSON with a trailing comma at the end of the object.',
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
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const formRef = useRef<FormikProps<{}>>(null);

  useEffect(() => {
    if (input) {
      compute(input);
    }
  }, [input]);

  const compute = (input: string) => {
    const { valid, error } = validateJson(input);
    if (valid) {
      setResult('✅ Valid JSON');
    } else {
      setResult(`❌ ${error}`);
    }
  };

  return (
    <Box>
      <ToolInputAndResult
        input={
          <ToolTextInput title="Input JSON" value={input} onChange={setInput} />
        }
        result={<ToolTextResult title="Validation Result" value={result} />}
      />

      <ToolInfo
        title="What is JSON Validation?"
        description="JSON validation checks the syntax and structure of a JSON file to ensure it follows proper JSON format."
      />

      <Separator backgroundColor="#5581b5" margin="50px" />

      <ToolExamples
        title={title}
        exampleCards={exampleCards}
        getGroups={() => []}
        formRef={formRef}
        setInput={setInput}
      />
    </Box>
  );
}
