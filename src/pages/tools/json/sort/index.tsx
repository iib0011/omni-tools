import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolCodeInput from '@components/input/ToolCodeInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { sortJson } from './service';
import { CardExampleType } from '@components/examples/ToolExamples';
import SelectWithDesc from '@components/options/SelectWithDesc';
import { ToolComponentProps } from '@tools/defineTool';
import ToolContent from '@components/ToolContent';
import { InitialValuesType } from './types';
import { GetGroupsType } from '@components/options/ToolOptions';
import { getJsonHeaders } from '@utils/json';
import { useTranslation } from 'react-i18next';

const initialValues: InitialValuesType = {
  mode: 'value',
  key: '',
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
    sampleOptions: { mode: 'value', key: 'name', order: 'asc' }
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
    sampleOptions: { mode: 'key', key: '', order: 'asc' }
  }
];

export default function SortJson({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation('json');
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (values: InitialValuesType, input: string) => {
    if (!input.trim()) return;
    setResult(sortJson(input, values));
  };

  const keys = getJsonHeaders(input);
  const keyOptions =
    keys.length > 0
      ? keys.map((item) => ({
          label: item,
          value: item
        }))
      : [];

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: t('sortJson.options.title'),
      component: (
        <Box>
          <SelectWithDesc
            selected={values.mode}
            options={[
              {
                label: t('sortJson.options.sortByValue'),
                value: 'value'
              },
              {
                label: t('sortJson.options.sortByKey'),
                value: 'key'
              }
            ]}
            onChange={(value) => {
              updateField('mode', value);
              updateField('key', '');
            }}
            description={t('sortJson.options.modeDescription')}
          />
          {values.mode === 'value' && (
            <SelectWithDesc
              selected={values.key}
              options={[
                { label: 'Please select a key', value: '' },
                ...keyOptions
              ]}
              onChange={(value) => updateField('key', value)}
              description={t('sortJson.options.keyDescription')}
            />
          )}
          <SelectWithDesc
            selected={values.order}
            options={[
              {
                label: t('sortJson.options.ascending'),
                value: 'asc'
              },
              {
                label: t('sortJson.options.descending'),
                value: 'desc'
              }
            ]}
            onChange={(value) => updateField('order', value)}
            description={t('sortJson.options.orderDescription')}
          />
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      inputComponent={
        <ToolCodeInput
          title={t('sortJson.inputTitle')}
          value={input}
          onChange={setInput}
          language={'json'}
        />
      }
      resultComponent={
        <ToolTextResult
          title={t('sortJson.resultTitle')}
          value={result}
          extension={'json'}
        />
      }
      initialValues={initialValues}
      getGroups={getGroups}
      compute={compute}
      input={input}
      setInput={setInput}
      exampleCards={exampleCards}
      toolInfo={{ title: `What is a ${title}?`, description: longDescription }}
    />
  );
}
