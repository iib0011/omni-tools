import React, { useState, useEffect } from 'react';
import { Box, MenuItem, TextField } from '@mui/material';
import ToolCodeInput from '@components/input/ToolCodeInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { sortJson } from './service';
import ToolExamples, {
  CardExampleType
} from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import ToolContent from '@components/ToolContent';

type SortMode = 'value' | 'key';

type InitialValuesType = {
  sortMode: SortMode;
  sortKey: string;
  order: 'asc' | 'desc';
};

const initialValues: InitialValuesType = {
  sortMode: 'value',
  sortKey: '',
  order: 'asc'
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Sort by name ascending',
    description:
      'Sort a JSON array of objects alphabetically by the "name" key.',
    sampleText: `[{"name":"Charlie","age":30},{"name":"Alice","age":25},{"name":"Bob","age":35}]`,
    sampleResult: `[
  {
    "name": "Alice",
    "age": 25
  },
  {
    "name": "Bob",
    "age": 35
  },
  {
    "name": "Charlie",
    "age": 30
  }
]`,
    sampleOptions: { sortMode: 'value', sortKey: 'name', order: 'asc' }
  },
  {
    title: 'Sort object keys alphabetically',
    description:
      'Sort the keys of a JSON object alphabetically in ascending order.',
    sampleText: `{"zebra":1,"apple":2,"mango":3}`,
    sampleResult: `{
  "apple": 2,
  "mango": 3,
  "zebra": 1
}`,
    sampleOptions: { sortMode: 'key', sortKey: '', order: 'asc' }
  }
];

export default function SortJson({ title }: ToolComponentProps) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [availableKeys, setAvailableKeys] = useState<string[]>([]);
  const [inputError, setInputError] = useState('');

  useEffect(() => {
    if (!input.trim()) {
      setAvailableKeys([]);
      setInputError('');
      return;
    }
    try {
      const parsed = JSON.parse(input);
      const keys = new Set<string>();
      if (Array.isArray(parsed)) {
        parsed.forEach((item) => {
          if (item && typeof item === 'object') {
            Object.keys(item).forEach((k) => keys.add(k));
          }
        });
      } else if (parsed && typeof parsed === 'object') {
        Object.keys(parsed).forEach((k) => keys.add(k));
      }
      setAvailableKeys(Array.from(keys).sort());
      setInputError('');
    } catch {
      setAvailableKeys([]);
      setInputError('Invalid JSON');
    }
  }, [input]);

  const compute = (optionsValues: InitialValuesType, input: string) => {
    const { sortMode, sortKey, order } = optionsValues;
    if (!input.trim()) return;

    if (sortMode === 'value') {
      if (availableKeys.length === 0) return;
      if (!sortKey) {
        setResult('');
        return;
      }
      setResult(sortJson(input, sortKey, order, 'value'));
    } else {
      setResult(sortJson(input, sortKey, order, 'key'));
    }
  };

  return (
    <ToolContent
      title={title}
      inputComponent={
        <ToolCodeInput
          title={'Input JSON'}
          value={input}
          onChange={setInput}
          language={'json'}
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
                label={'Sort mode'}
                size={'small'}
                select
                value={values.sortMode}
                onChange={(e) => {
                  setFieldValue('sortMode', e.target.value);
                  setFieldValue('sortKey', '');
                }}
              >
                <MenuItem value={'value'}>Sort array by key value</MenuItem>
                <MenuItem value={'key'}>
                  Sort object keys alphabetically
                </MenuItem>
              </TextField>
              {values.sortMode === 'value' && (
                <TextField
                  label={'Sort key'}
                  size={'small'}
                  select
                  value={values.sortKey}
                  onChange={(e) => setFieldValue('sortKey', e.target.value)}
                  error={!!inputError}
                  helperText={inputError}
                >
                  {availableKeys.length === 0 ? (
                    <MenuItem value={''} disabled>
                      {input.trim()
                        ? 'No keys found'
                        : 'Enter JSON to see keys'}
                    </MenuItem>
                  ) : (
                    availableKeys.map((key) => (
                      <MenuItem key={key} value={key}>
                        {key}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              )}
              <TextField
                label={'Order'}
                size={'small'}
                select
                value={values.order}
                onChange={(e) => setFieldValue('order', e.target.value)}
              >
                <MenuItem value={'asc'}>Ascending (A → Z)</MenuItem>
                <MenuItem value={'desc'}>Descending (Z → A)</MenuItem>
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
        title: 'Sort JSON',
        description:
          'Sort a JSON array of objects by any key, or sort the keys of a JSON object alphabetically.'
      }}
    />
  );
}
