import { useState } from 'react';
import ToolContent from '@components/ToolContent';
import ToolCodeInput from '@components/input/ToolCodeInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { convertJsonToCsv } from './service';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { Box } from '@mui/material';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import SimpleRadio from '@components/options/SimpleRadio';
import { InitialValuesType } from './types';
import { useTranslation } from 'react-i18next';

const initialValues: InitialValuesType = {
  delimiter: ',',
  includeHeaders: true,
  quoteStrings: 'auto'
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Array of objects',
    description:
      'Convert multiple JSON objects into CSV rows, one row per object.',
    sampleText: `[
  { "name": "John Doe", "age": 25, "city": "New York" },
  { "name": "Jane Doe", "age": 30, "city": "Los Angeles" },
  { "name": "Bob Smith", "age": 22, "city": "Chicago" }
]`,
    sampleResult: `name,age,city\nJohn Doe,25,New York\nJane Doe,30,Los Angeles\nBob Smith,22,Chicago`,
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
    "name": "John Doe",
    "age": 25,
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001"
    },
    "hobbies": ["reading", "running"]
  }
]`,
    sampleResult: `name,age,address.street,address.city,address.state,address.postalCode,hobbies[0],hobbies[1]\nJohn Doe,25,123 Main St,New York,NY,10001,reading,running`,
    sampleOptions: {
      ...initialValues
    }
  },
  {
    title: 'Sparse rows',
    description:
      'Missing keys are filled with empty values to keep columns aligned.',
    sampleText: `[
  { "name": "Alice", "age": 30 },
  { "name": "Bob", "city": "Paris" },
  { "name": "Carol", "age": 25, "city": "Rome" }
]`,
    sampleResult: `name,age,city\nAlice,30,\nBob,,Paris\nCarol,25,Rome`,
    sampleOptions: {
      ...initialValues
    }
  }
];

export default function JsonToCsv({ title }: ToolComponentProps) {
  const { t } = useTranslation('json');
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
          title={t('jsonToCsv.inputTitle')}
          value={input}
          onChange={setInput}
          language="json"
        />
      }
      resultComponent={
        <ToolTextResult
          title={t('jsonToCsv.outputTitle')}
          value={result}
          extension={'csv'}
        />
      }
      getGroups={({ values, updateField }) => [
        {
          title: t('jsonToCsv.delimiterOption'),
          component: (
            <Box>
              <TextFieldWithDesc
                description={t('jsonToCsv.options.delimiter')}
                value={values.delimiter}
                onOwnChange={(val) => updateField('delimiter', val)}
              />
            </Box>
          )
        },
        {
          title: t('jsonToCsv.quotingOption'),
          component: (
            <Box>
              <SimpleRadio
                checked={values.quoteStrings === 'auto'}
                title={t('jsonToCsv.options.autoQuote.label')}
                description={t('jsonToCsv.options.autoQuote.description')}
                onClick={() => updateField('quoteStrings', 'auto')}
              />
              <SimpleRadio
                checked={values.quoteStrings === 'always'}
                title={t('jsonToCsv.options.alwaysQuote.label')}
                description={t('jsonToCsv.options.alwaysQuote.description')}
                onClick={() => updateField('quoteStrings', 'always')}
              />
            </Box>
          )
        },
        {
          title: t('jsonToCsv.headerOption'),
          component: (
            <Box>
              <CheckboxWithDesc
                checked={values.includeHeaders}
                onChange={(value) => updateField('includeHeaders', value)}
                title={t('jsonToCsv.options.header.label')}
                description={t('jsonToCsv.options.header.description')}
              />
            </Box>
          )
        }
      ]}
    />
  );
}
