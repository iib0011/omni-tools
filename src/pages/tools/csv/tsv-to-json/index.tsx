import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import ToolCodeInput from '@components/input/ToolCodeInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { convertTsvToJson } from './service';
import { CardExampleType } from '@components/examples/ToolExamples';
import { GetGroupsType } from '@components/options/ToolOptions';
import { ToolComponentProps } from '@tools/defineTool';
import { Box } from '@mui/material';
import { updateNumberField } from '@utils/string';
import SimpleRadio from '@components/options/SimpleRadio';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { InitialValuesType } from './types';

const initialValues: InitialValuesType = {
  delimiter: '\t',
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
    title: 'Basic TSV to JSON Array',
    description:
      'Convert a simple TSV file into a JSON array structure by using spaces as formatting indentation.',
    sampleText: `name	age	city
John	30	New York
Alice	25	London`,
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
    title: 'Turn TSV to JSON without Headers',
    description: 'Convert a TSV file in minified JSON file.',
    sampleText: `Square	Triangle	Circle
Cube	Cone	Sphere
#Oval`,
    sampleResult: `[["Square","Triangle","Circle"],["Cube","Cone","Sphere"]]`,
    sampleOptions: {
      ...initialValues,
      useHeaders: false,
      indentationType: 'none'
    }
  },
  {
    title: 'Transform TSV to JSON with Headers',
    description: 'Convert a TSV file with headers into a JSON file.',
    sampleText: `item	material	quantity


Hat	Wool	3
Gloves	Leather	5
Candle	Wax	4
Vase	Glass	2

Sculpture	Bronze	1
Table	Wood	1

Bookshelf	Wood	2`,
    sampleResult: `[
  {
    "item": "Hat",
    "material": "Wool",
    "quantity": 3
  },
  {
    "item": "Gloves",
    "material": "Leather",
    "quantity": 5
  },
  {
    "item": "Candle",
    "material": "Wax",
    "quantity": 4
  },
  {
    "item": "Vase",
    "material": "Glass",
    "quantity": 2
  },
  {
    "item": "Sculpture",
    "material": "Bronze",
    "quantity": 1
  },
  {
    "item": "Table",
    "material": "Wood",
    "quantity": 1
  },
  {
    "item": "Bookshelf",
    "material": "Wood",
    "quantity": 2
  }
]`,
    sampleOptions: {
      ...initialValues
    }
  }
];

export default function TsvToJson({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (values: InitialValuesType, input: string) => {
    setResult(convertTsvToJson(input, values));
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: 'Input CSV Format',
      component: (
        <Box>
          <TextFieldWithDesc
            description="Character used to qutoe tsv values"
            onOwnChange={(val) => updateField('quote', val)}
            value={values.quote}
          />
          <TextFieldWithDesc
            description="Symbol use to mark comments in the TSV"
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
            checked={values.dynamicTypes}
            onChange={(value) => updateField('dynamicTypes', value)}
            title="Dynamic Types"
            description="Convert numbers and booleans to their proper types"
          />
        </Box>
      )
    },
    {
      title: 'Output Formatting',
      component: (
        <Box>
          <SimpleRadio
            onClick={() => updateField('indentationType', 'space')}
            checked={values.indentationType === 'space'}
            title={'Use Spaces for indentation'}
          />
          {values.indentationType === 'space' && (
            <TextFieldWithDesc
              description="Number of spaces for indentation"
              value={values.spacesCount}
              onOwnChange={(val) =>
                updateNumberField(val, 'spacesCount', updateField)
              }
              type="number"
            />
          )}
          <SimpleRadio
            onClick={() => updateField('indentationType', 'tab')}
            checked={values.indentationType === 'tab'}
            title={'Use Tabs for indentation'}
          />
          <SimpleRadio
            onClick={() => updateField('indentationType', 'none')}
            checked={values.indentationType === 'none'}
            title={'Minify JSON'}
          />
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      input={input}
      setInput={setInput}
      initialValues={initialValues}
      compute={compute}
      exampleCards={exampleCards}
      getGroups={getGroups}
      inputComponent={
        <ToolCodeInput
          title="Input TSV"
          value={input}
          onChange={setInput}
          language="tsv"
        />
      }
      resultComponent={
        <ToolTextResult title="Output JSON" value={result} extension={'json'} />
      }
      toolInfo={{ title: `What is a ${title}?`, description: longDescription }}
    />
  );
}
