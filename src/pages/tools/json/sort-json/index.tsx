import React, { useState } from 'react';
import { Box, MenuItem, TextField } from '@mui/material';
import ToolCodeInput from '@components/input/ToolCodeInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { sortJson } from './service';
import ToolExamples, {
  CardExampleType
} from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import ToolContent from '@components/ToolContent';

type InitialValuesType = {
  sortKey: string;
  order: 'asc' | 'desc';
};

const initialValues: InitialValuesType = {
  sortKey: '',
  order: 'asc'
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Sort by name ascending',
    description:
      'Sort a JSON array of objects alphabetically by the "name" key.',
    sampleText: `[{"name":"Charlie","age":30},{"name":"Alice","age":25},{"name":"Bob","age":35}]`,
    sampleResult: `[\n  {\n    "name": "Alice",\n    "age": 25\n  },\n  {\n    "name": "Bob",\n    "age": 35\n  },\n  {\n    "name": "Charlie",\n    "age": 30\n  }\n]`,
    sampleOptions: { sortKey: 'name', order: 'asc' }
  }
];

export default function SortJson({ title }: ToolComponentProps) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  const compute = (optionsValues: InitialValuesType, input: string) => {
    const { sortKey, order } = optionsValues;
    if (input && sortKey) {
      setResult(sortJson(input, sortKey, order));
    }
  };

  return (
    <ToolContent
      title={title}
      inputComponent={
        <ToolCodeInput
          title={'Input JSON array'}
          value={input}
          onChange={setInput}
          lang={'json'}
        />
      }
      resultComponent={<ToolTextResult title={'Sorted JSON'} value={result} />}
      initialValues={initialValues}
      getGroups={({ values, setFieldValue }) => [
        {
          title: 'Sort options',
          component: (
            <Box display={'flex'} flexDirection={'column'} gap={2}>
              <TextField
                label={'Sort key'}
                size={'small'}
                value={values.sortKey}
                onChange={(e) => setFieldValue('sortKey', e.target.value)}
                placeholder={'e.g. name, age, date'}
              />
              <TextField
                label={'Order'}
                size={'small'}
                select
                value={values.order}
                onChange={(e) => setFieldValue('order', e.target.value)}
              >
                <MenuItem value={'asc'}>Ascending</MenuItem>
                <MenuItem value={'desc'}>Descending</MenuItem>
              </TextField>
            </Box>
          )
        }
      ]}
      compute={compute}
      setInput={setInput}
      input={input}
      exampleCards={exampleCards}
      toolInfo={{
        title: 'Sort JSON Array',
        description:
          'Sort a JSON array of objects by any key in ascending or descending order.'
      }}
    />
  );
}
