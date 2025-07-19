import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import ToolCodeInput from '@components/input/ToolCodeInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { stringifyJson } from './service';
import { ToolComponentProps } from '@tools/defineTool';
import RadioWithTextField from '@components/options/RadioWithTextField';
import SimpleRadio from '@components/options/SimpleRadio';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import { isNumber, updateNumberField } from '@utils/string';
import { CardExampleType } from '@components/examples/ToolExamples';

type InitialValuesType = {
  indentationType: 'tab' | 'space';
  spacesCount: number;
  escapeHtml: boolean;
};

const initialValues: InitialValuesType = {
  indentationType: 'space',
  spacesCount: 2,
  escapeHtml: false
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Simple Object to JSON',
    description: 'Convert a basic JavaScript object into a JSON string.',
    sampleText: `{ name: "John", age: 30 }`,
    sampleResult: `{
  "name": "John",
  "age": 30
}`,
    sampleOptions: {
      indentationType: 'space',
      spacesCount: 2,
      escapeHtml: false
    }
  },
  {
    title: 'Array with Mixed Types',
    description:
      'Convert an array containing different types of values into JSON.',
    sampleText: `[1, "hello", true, null, { x: 10 }]`,
    sampleResult: `[
    1,
    "hello",
    true,
    null,
    {
        "x": 10
    }
]`,
    sampleOptions: {
      indentationType: 'space',
      spacesCount: 4,
      escapeHtml: false
    }
  },
  {
    title: 'HTML-Escaped JSON',
    description: 'Convert an object to JSON with HTML characters escaped.',
    sampleText: `{
  html: "<div>Hello & Welcome</div>",
  message: "Special chars: < > & ' \\""
}`,
    sampleResult: `{
  &quot;html&quot;: &quot;&lt;div&gt;Hello &amp; Welcome&lt;/div&gt;&quot;,
  &quot;message&quot;: &quot;Special chars: &lt; &gt; &amp; &#039; &quot;&quot;
}`,
    sampleOptions: {
      indentationType: 'space',
      spacesCount: 2,
      escapeHtml: true
    }
  }
];

export default function StringifyJson({ title }: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (values: InitialValuesType, input: string) => {
    if (input) {
      setResult(
        stringifyJson(
          input,
          values.indentationType,
          values.spacesCount,
          values.escapeHtml
        )
      );
    }
  };

  return (
    <ToolContent
      title={title}
      input={input}
      setInput={setInput}
      initialValues={initialValues}
      compute={compute}
      exampleCards={exampleCards}
      inputComponent={
        <ToolCodeInput
          title="JavaScript Object/Array"
          value={input}
          onChange={setInput}
          language="json"
        />
      }
      resultComponent={
        <ToolTextResult title="JSON String" value={result} extension={'json'} />
      }
      getGroups={({ values, updateField }) => [
        {
          title: 'Indentation',
          component: (
            <Box>
              <RadioWithTextField
                checked={values.indentationType === 'space'}
                title="Use Spaces"
                fieldName="indentationType"
                description="Indent output with spaces"
                value={values.spacesCount.toString()}
                onRadioClick={() => updateField('indentationType', 'space')}
                onTextChange={(val) =>
                  updateNumberField(val, 'spacesCount', updateField)
                }
              />
              <SimpleRadio
                onClick={() => updateField('indentationType', 'tab')}
                checked={values.indentationType === 'tab'}
                description="Indent output with tabs"
                title="Use Tabs"
              />
            </Box>
          )
        },
        {
          title: 'Options',
          component: (
            <CheckboxWithDesc
              checked={values.escapeHtml}
              onChange={(value) => updateField('escapeHtml', value)}
              title="Escape HTML Characters"
              description="Convert HTML special characters to their entity references"
            />
          )
        }
      ]}
      toolInfo={{
        title: 'What Is JSON Stringify?',
        description:
          'JSON Stringify is a tool that converts JavaScript objects and arrays into their JSON string representation. It properly formats the output with customizable indentation and offers the option to escape HTML special characters, making it safe for web usage. This tool is particularly useful when you need to serialize data structures for storage or transmission, or when you need to prepare JSON data for HTML embedding.'
      }}
    />
  );
}
