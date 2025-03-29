import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { escapeJson } from './service';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import { Box } from '@mui/material';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';

const initialValues = {
  wrapInQuotesFlag: false
};

type InitialValuesType = typeof initialValues;

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Escape a Simple JSON Object',
    description: `In this example, we escape all quotes (") around the keys and values in a simple JSON object. This ensures that the JSON data is interpreted correctly if it's used in another JSON object or assigned to a variable as a string.`,
    sampleText: `{"country": "Spain", "capital": "Madrid"}`,
    sampleResult: `{{\\"country\\": \\"Spain\\", \\"capital\\": \\"Madrid\\"}`,
    sampleOptions: {
      wrapInQuotesFlag: false
    }
  },
  {
    title: 'Escape a Complex JSON Object',
    description: `In this example, we escape a more complex JSON object with nested elements containing data about the Margherita pizza recipe. We escape all quotes within the object as well as convert all line breaks into special "\n" characters. Additionally, we wrap the entire output in double quotes by enabling the "Wrap Output in Quotes" option.`,
    sampleText: `{
  "name": "Pizza Margherita",
  "ingredients": [
    "tomato sauce",
    "mozzarella cheese",
    "fresh basil"
  ],
  "price": 12.50,
  "vegetarian": true
}`,
    sampleResult: `"{\\n  \\"name\\": \\"Pizza Margherita\\",\\n  \\"ingredients\\": [\\n\\"tomato sauce\\",\\n    \\"mozzarella cheese\\",\\n    \\"fresh basil\\"\\n  ],\\n  \\"price\\": 12.50,\\n  \\"vegetarian\\": true\\n}"`,
    sampleOptions: {
      wrapInQuotesFlag: true
    }
  },
  {
    title: 'Escape a JSON Array of Numbers',
    description: `This example showcases that escaping isn't necessary for JSON arrays containing only numbers. Since numbers themselves don't hold special meaning in JSON, the tool doesn't modify the input and the output remains the same as the original JSON array.`,
    sampleText: `[1, 2, 3]`,
    sampleResult: `[1, 2, 3]`,
    sampleOptions: {
      wrapInQuotesFlag: false
    }
  }
];

export default function EscapeJsonTool({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (options: InitialValuesType, input: string) => {
    setResult(escapeJson(input, options.wrapInQuotesFlag));
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: 'Quote Output',
      component: (
        <Box>
          <CheckboxWithDesc
            onChange={(val) => updateField('wrapInQuotesFlag', val)}
            checked={values.wrapInQuotesFlag}
            title={'Wrap Output In Quotes'}
            description={'Add double quotes around the output JSON data.'}
          />
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      inputComponent={
        <ToolTextInput title="Input JSON" value={input} onChange={setInput} />
      }
      resultComponent={
        <ToolTextResult
          title="Escaped JSON"
          value={result}
          removeSpecialCharacters={false}
        />
      }
      initialValues={initialValues}
      getGroups={getGroups}
      toolInfo={{
        title: 'What is a JSON Escaper?',
        description: longDescription
      }}
      exampleCards={exampleCards}
      input={input}
      setInput={setInput}
      compute={compute}
    />
  );
}
