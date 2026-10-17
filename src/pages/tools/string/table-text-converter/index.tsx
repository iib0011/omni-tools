import React, { useState } from 'react';
import { Box, FormControlLabel, Switch } from '@mui/material';
import ToolContent from '@components/ToolContent';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import SelectWithDesc from '@components/options/SelectWithDesc';
import { GetGroupsType } from '@components/options/ToolOptions';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { useTranslation } from 'react-i18next';
import { convertTable } from './service';
import { InitialValuesType, TableFormat } from './types';
const initialValues: InitialValuesType = {
  autodetect: true,
  inputFormat: 'csv',
  outputFormat: 'markdown'
};

const formatOptions: { label: string; value: TableFormat }[] = [
  { label: 'Markdown', value: 'markdown' },
  { label: 'CSV', value: 'csv' },
  { label: 'TSV', value: 'tsv' },
  { label: 'HTML', value: 'html' },
  { label: 'MySQL', value: 'mysql' },
  { label: 'JSON', value: 'json' }
];

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Markdown table to CSV',
    description: 'Convert a markdown table into CSV format.',
    sampleText: `| Name  | Age | City     |
| ----- | --- | -------- |
| John  | 30  | New York |
| Alice | 25  | London   |`,
    sampleResult: `Name,Age,City
John,30,New York
Alice,25,London`,
    sampleOptions: {
      autodetect: false,
      inputFormat: 'markdown',
      outputFormat: 'csv'
    }
  },
  {
    title: 'HTML table to Markdown',
    description: 'Convert an HTML table into a markdown table.',
    sampleText: `<table>
  <tr><th>Product</th><th>Price</th></tr>
  <tr><td>Apple</td><td>1.99</td></tr>
  <tr><td>Banana</td><td>0.99</td></tr>
</table>`,
    sampleResult: `| Product | Price |
| --- | --- |
| Apple | 1.99 |
| Banana | 0.99 |`,
    sampleOptions: {
      autodetect: false,
      inputFormat: 'html',
      outputFormat: 'markdown'
    }
  },
  {
    title: 'MySQL output to Markdown',
    description: 'Convert a MySQL query result to a markdown table.',
    sampleText: `+----+-------+
| id | name  |
+----+-------+
| 1  | John  |
| 2  | Alice |
+----+-------+`,
    sampleResult: `| id | name |
| --- | --- |
| 1 | John |
| 2 | Alice |`,
    sampleOptions: {
      autodetect: false,
      inputFormat: 'mysql',
      outputFormat: 'markdown'
    }
  }
];

const extensionByFormat: Record<TableFormat, string> = {
  markdown: 'md',
  csv: 'csv',
  tsv: 'tsv',
  html: 'html',
  mysql: 'txt',
  json: 'json'
};

export default function TableTextConverter({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation('string');
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [extension, setExtension] = useState<string>('txt');

  const compute = (values: InitialValuesType, input: string) => {
    if (!input) {
      setResult('');
      return;
    }
    try {
      setResult(convertTable(input, values));
      setExtension(extensionByFormat[values.outputFormat]);
    } catch (error) {
      setResult(
        `${t('tableTextConverter.error')}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      setExtension('txt');
    }
  };

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: t('tableTextConverter.options'),
      component: (
        <Box>
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={values.autodetect}
                  onChange={(e) => {
                    updateField('autodetect', e.target.checked);
                  }}
                />
              }
              label={t('tableTextConverter.autoDetect')}
            />
          </Box>
          {!values.autodetect && (
            <SelectWithDesc
              selected={values.inputFormat}
              options={formatOptions}
              onChange={(value) => updateField('inputFormat', value)}
              description={t('tableTextConverter.inputFormat')}
            />
          )}
          <SelectWithDesc
            selected={values.outputFormat}
            options={formatOptions}
            onChange={(value) => updateField('outputFormat', value)}
            description={t('tableTextConverter.outputFormat')}
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
      inputComponent={
        <ToolTextInput
          title={t('tableTextConverter.inputTitle')}
          value={input}
          onChange={setInput}
        />
      }
      resultComponent={
        <ToolTextResult
          title={t('tableTextConverter.resultTitle')}
          value={result}
          extension={extension}
        />
      }
      getGroups={getGroups}
      toolInfo={{
        title: `What is a ${title}?`,
        description: longDescription
      }}
    />
  );
}
