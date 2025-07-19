import { useState } from 'react';
import ToolContent from '@components/ToolContent';
import ToolCodeInput from '@components/input/ToolCodeInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { convertJsonToXml } from './service';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { Box } from '@mui/material';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import SimpleRadio from '@components/options/SimpleRadio';

type InitialValuesType = {
  indentationType: 'space' | 'tab' | 'none';
  addMetaTag: boolean;
};

const initialValues: InitialValuesType = {
  indentationType: 'space',
  addMetaTag: false
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Basic JSON to XML',
    description: 'Convert a simple JSON object into an XML format.',
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
    sampleResult: `<root>
\t<users>
\t\t<name>John</name>
\t\t<age>30</age>
\t\t<city>New York</city>
\t</users>
\t<users>
\t\t<name>Alice</name>
\t\t<age>25</age>
\t\t<city>London</city>
\t</users>
</root>`,
    sampleOptions: {
      ...initialValues
    }
  }
];

export default function JsonToXml({ title }: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (values: InitialValuesType, input: string) => {
    if (input) {
      try {
        const xmlResult = convertJsonToXml(input, values);
        setResult(xmlResult);
      } catch (error) {
        setResult(
          `Error: ${
            error instanceof Error ? error.message : 'Invalid Json format'
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
          title="Input Json"
          value={input}
          onChange={setInput}
          language="json"
        />
      }
      resultComponent={
        <ToolTextResult title="Output XML" value={result} extension={'xml'} />
      }
      getGroups={({ values, updateField }) => [
        {
          title: 'Output XML Indentation',
          component: (
            <Box>
              <SimpleRadio
                checked={values.indentationType === 'space'}
                title={'Use Spaces for indentation'}
                description={
                  'Use spaces to visualize the hierarchical structure of XML.'
                }
                onClick={() => updateField('indentationType', 'space')}
              />
              <SimpleRadio
                checked={values.indentationType === 'tab'}
                title={'Use Tabs for indentation'}
                description={
                  'Use tabs to visualize the hierarchical structure of XML.'
                }
                onClick={() => updateField('indentationType', 'tab')}
              />
              <SimpleRadio
                checked={values.indentationType === 'none'}
                title={'No indentation'}
                description={'Output XML without any indentation.'}
                onClick={() => updateField('indentationType', 'none')}
              />
            </Box>
          )
        },
        {
          title: 'XML Meta Information',
          component: (
            <Box>
              <CheckboxWithDesc
                checked={values.addMetaTag}
                onChange={(value) => updateField('addMetaTag', value)}
                title="Add an XML Meta Tag"
                description="Add a meta tag at the beginning of the XML output."
              />
            </Box>
          )
        }
      ]}
    />
  );
}
