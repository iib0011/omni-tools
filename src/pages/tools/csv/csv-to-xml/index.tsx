import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { convertCsvToXml } from './service';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { Box } from '@mui/material';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';

type InitialValuesType = {
  delimiter: string;
  quote: string;
  comment: string;
  useHeaders: boolean;
  skipEmptyLines: boolean;
};

const initialValues: InitialValuesType = {
  delimiter: ',',
  quote: '"',
  comment: '#',
  useHeaders: true,
  skipEmptyLines: true
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Basic CSV to XML',
    description: 'Convert a simple CSV file into an XML format.',
    sampleText: 'name,age,city\nJohn,30,New York\nAlice,25,London',
    sampleResult: `<root>
  <row>
    <name>John</name>
    <age>30</age>
    <city>New York</city>
  </row>
  <row>
    <name>Alice</name>
    <age>25</age>
    <city>London</city>
  </row>
</root>`,
    sampleOptions: {
      ...initialValues,
      useHeaders: true
    }
  }
];

export default function CsvToXml({ title }: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (values: InitialValuesType, input: string) => {
    if (input) {
      try {
        const xmlResult = convertCsvToXml(input, values);
        setResult(xmlResult);
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
        <ToolTextInput title="Input CSV" value={input} onChange={setInput} />
      }
      resultComponent={<ToolTextResult title="Output XML" value={result} />}
      getGroups={({ values, updateField }) => [
        {
          title: 'Input CSV Format',
          component: (
            <Box>
              <TextFieldWithDesc
                description="Column Separator"
                value={values.delimiter}
                onOwnChange={(val) => updateField('delimiter', val)}
              />
              <TextFieldWithDesc
                description="Field Quote"
                onOwnChange={(val) => updateField('quote', val)}
                value={values.quote}
              />
              <TextFieldWithDesc
                description="Comment Symbol"
                value={values.comment}
                onOwnChange={(val) => updateField('comment', val)}
              />
            </Box>
          )
        },
        {
          title: 'Conversion Options',
          component: (
            <Box>
              <CheckboxWithDesc
                checked={values.useHeaders}
                onChange={(value) => updateField('useHeaders', value)}
                title="Use Headers"
                description="First row is treated as column headers"
              />
              <CheckboxWithDesc
                checked={values.skipEmptyLines}
                onChange={(value) => updateField('skipEmptyLines', value)}
                title="Skip Empty Lines"
                description="Don't process empty lines in the CSV"
              />
            </Box>
          )
        }
      ]}
    />
  );
}
