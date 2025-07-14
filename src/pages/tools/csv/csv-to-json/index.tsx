import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { convertCsvToJson } from './service';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { Box } from '@mui/material';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { useTranslation } from 'react-i18next';

type InitialValuesType = {
  delimiter: string;
  quote: string;
  comment: string;
  useHeaders: boolean;
  skipEmptyLines: boolean;
  dynamicTypes: boolean;
  indentationType: 'tab' | 'space';
  spacesCount: number;
};

const initialValues: InitialValuesType = {
  delimiter: ',',
  quote: '"',
  comment: '#',
  useHeaders: true,
  skipEmptyLines: true,
  dynamicTypes: true,
  indentationType: 'space',
  spacesCount: 2
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Basic CSV to JSON Array',
    description: 'Convert a simple CSV file into a JSON array structure.',
    sampleText: 'name,age,city\nJohn,30,New York\nAlice,25,London',
    sampleResult: `[
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
]`,
    sampleOptions: {
      ...initialValues,
      useHeaders: true,
      dynamicTypes: true
    }
  },
  {
    title: 'CSV with Custom Delimiter',
    description: 'Convert a CSV file that uses semicolons as separators.',
    sampleText: 'product;price;quantity\nApple;1.99;50\nBanana;0.99;100',
    sampleResult: `[
  {
    "product": "Apple",
    "price": 1.99,
    "quantity": 50
  },
  {
    "product": "Banana",
    "price": 0.99,
    "quantity": 100
  }
]`,
    sampleOptions: {
      ...initialValues,
      delimiter: ';'
    }
  },
  {
    title: 'CSV with Comments and Empty Lines',
    description: 'Process CSV data while handling comments and empty lines.',
    sampleText: `# This is a comment
id,name,active
1,John,true

# Another comment
2,Jane,false

3,Bob,true`,
    sampleResult: `[
  {
    "id": 1,
    "name": "John",
    "active": true
  },
  {
    "id": 2,
    "name": "Jane",
    "active": false
  },
  {
    "id": 3,
    "name": "Bob",
    "active": true
  }
]`,
    sampleOptions: {
      ...initialValues,
      skipEmptyLines: true,
      comment: '#'
    }
  }
];

export default function CsvToJson({ title }: ToolComponentProps) {
  const { t } = useTranslation('csv');
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (values: InitialValuesType, input: string) => {
    if (input) {
      try {
        const jsonResult = convertCsvToJson(input, {
          delimiter: values.delimiter,
          quote: values.quote,
          comment: values.comment,
          useHeaders: values.useHeaders,
          skipEmptyLines: values.skipEmptyLines,
          dynamicTypes: values.dynamicTypes
        });
        setResult(jsonResult);
      } catch (error) {
        setResult(
          `Error: ${
            error instanceof Error ? error.message : 'Invalid CSV format'
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
        <ToolTextInput
          title={t('csvToJson.inputTitle')}
          value={input}
          onChange={setInput}
        />
      }
      resultComponent={
        <ToolTextResult
          title={t('csvToJson.resultTitle')}
          value={result}
          extension={'json'}
        />
      }
      getGroups={({ values, updateField }) => [
        {
          title: t('csvToJson.inputCsvFormat'),
          component: (
            <Box>
              <TextFieldWithDesc
                description={t('csvToJson.columnSeparator')}
                value={values.delimiter}
                onOwnChange={(val) => updateField('delimiter', val)}
              />
              <TextFieldWithDesc
                description={t('csvToJson.fieldQuote')}
                onOwnChange={(val) => updateField('quote', val)}
                value={values.quote}
              />
              <TextFieldWithDesc
                description={t('csvToJson.commentSymbol')}
                value={values.comment}
                onOwnChange={(val) => updateField('comment', val)}
              />
            </Box>
          )
        },
        {
          title: t('csvToJson.conversionOptions'),
          component: (
            <Box>
              <CheckboxWithDesc
                checked={values.useHeaders}
                onChange={(value) => updateField('useHeaders', value)}
                title={t('csvToJson.useHeaders')}
                description={t('csvToJson.useHeadersDescription')}
              />
              <CheckboxWithDesc
                checked={values.skipEmptyLines}
                onChange={(value) => updateField('skipEmptyLines', value)}
                title={t('csvToJson.skipEmptyLines')}
                description={t('csvToJson.skipEmptyLinesDescription')}
              />
              <CheckboxWithDesc
                checked={values.dynamicTypes}
                onChange={(value) => updateField('dynamicTypes', value)}
                title={t('csvToJson.dynamicTypes')}
                description={t('csvToJson.dynamicTypesDescription')}
              />
            </Box>
          )
        }
      ]}
      toolInfo={{
        title: 'What Is a CSV to JSON Converter?',
        description:
          'This tool transforms Comma Separated Values (CSV) files to JavaScript Object Notation (JSON) data structures. It supports various CSV formats with customizable delimiters, quote characters, and comment symbols. The converter can treat the first row as headers, skip empty lines, and automatically detect data types like numbers and booleans. The resulting JSON can be used for data migration, backups, or as input for other applications.'
      }}
    />
  );
}
