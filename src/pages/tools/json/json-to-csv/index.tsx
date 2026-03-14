import { useState } from 'react';
import ToolContent from '@components/ToolContent';
import ToolCodeInput from '@components/input/ToolCodeInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { convertJsonToCsv } from './service';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { Box } from '@mui/material';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import SimpleRadio from '@components/options/SimpleRadio';

type InitialValuesType = {
  delimiter: ',' | ';' | '\t';
  includeHeaders: boolean;
  quoteStrings: 'always' | 'auto' | 'never';
};

const initialValues: InitialValuesType = {
  delimiter: ',',
  includeHeaders: true,
  quoteStrings: 'auto'
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Array of objects',
    description: 'Convert a JSON array of objects into CSV rows.',
    sampleText: `
{
  "users": [
    {
      "name": "John",
      "age": 30,
      "city": "New York"
    },
    {
      "name": "Alice",
      "age": 25,
      "city": "London"
    }
  ]
}`,
    sampleResult: `name,age,city\nJohn,30,New York\nAlice,25,London`,
    sampleOptions: {
      ...initialValues
    }
  },
  {
    title: 'Nested object (dot notation)',
    description:
      'Nested keys are flattened using dot notation (e.g. address.city).',
    sampleText: `[
  {
    "name": "Bob",
    "address": {
      "city": "Berlin",
      "zip": "10115"
    }
  }
]`,
    sampleResult: `name,address.city,address.zip\nBob,Berlin,10115`,
    sampleOptions: {
      ...initialValues
    }
  }
];

export default function JsonToCsv({ title }: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (values: InitialValuesType, input: string) => {
    if (input) {
      try {
        const csvResult = convertJsonToCsv(input, values);
        setResult(csvResult);
      } catch (error) {
        setResult(
          `Error: ${
            error instanceof Error ? error.message : 'Invalid JSON format'
          }`
        );
      }
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
          title="Input JSON"
          value={input}
          onChange={setInput}
          language="json"
        />
      }
      resultComponent={
        <ToolTextResult title="Output CSV" value={result} extension={'csv'} />
      }
      getGroups={({ values, updateField }) => [
        {
          title: 'CSV Delimiter',
          component: (
            <Box>
              <SimpleRadio
                checked={values.delimiter === ','}
                title={'Comma  ,'}
                description={
                  'Standard CSV delimiter, compatible with most tools.'
                }
                onClick={() => updateField('delimiter', ',')}
              />
              <SimpleRadio
                checked={values.delimiter === ';'}
                title={'Semicolon  ;'}
                description={
                  'Common in European locales where commas are used as decimal separators.'
                }
                onClick={() => updateField('delimiter', ';')}
              />
              <SimpleRadio
                checked={values.delimiter === '\t'}
                title={'Tab  \\t'}
                description={'Produces a TSV (tab-separated values) file.'}
                onClick={() => updateField('delimiter', '\t')}
              />
            </Box>
          )
        },
        {
          title: 'String Quoting',
          component: (
            <Box>
              <SimpleRadio
                checked={values.quoteStrings === 'auto'}
                title={'Auto (recommended)'}
                description={
                  'Only wrap a cell in double-quotes when it contains the delimiter, a quote, or a newline.'
                }
                onClick={() => updateField('quoteStrings', 'auto')}
              />
              <SimpleRadio
                checked={values.quoteStrings === 'always'}
                title={'Always quote'}
                description={'Wrap every cell in double-quotes.'}
                onClick={() => updateField('quoteStrings', 'always')}
              />
              <SimpleRadio
                checked={values.quoteStrings === 'never'}
                title={'Never quote'}
                description={
                  'Never add quotes. Use only when you are sure values contain no special characters.'
                }
                onClick={() => updateField('quoteStrings', 'never')}
              />
            </Box>
          )
        },
        {
          title: 'Headers',
          component: (
            <Box>
              <CheckboxWithDesc
                checked={values.includeHeaders}
                onChange={(value) => updateField('includeHeaders', value)}
                title="Include header row"
                description="Output the JSON keys as the first row of the CSV."
              />
            </Box>
          )
        }
      ]}
    />
  );
}
