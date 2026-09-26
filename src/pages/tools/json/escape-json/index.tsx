import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ToolContent from '@components/ToolContent';
import ToolCodeInput from '@components/input/ToolCodeInput';
import ToolTextResult from '@components/result/ToolTextResult';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import { escapeJson } from './service';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';

const initialValues = {
  wrapInQuotesFlag: false
};

type InitialValuesType = typeof initialValues;

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Escape a Simple JSON Object',
    description:
      'In this example, we escape all double quotes in a JSON object. This makes the JSON safe to use as a string inside another JSON object or in source code.',
    sampleText: `{"country": "Spain", "capital": "Madrid"}`,
    sampleResult: `{\\"country\\": \\"Spain\\", \\"capital\\": \\"Madrid\\"}`,
    sampleOptions: {
      wrapInQuotesFlag: false
    }
  },
  {
    title: 'Escape a Complex JSON Object',
    description:
      'In this example, we escape quotes and line breaks from a formatted JSON object. The output is wrapped in double quotes to create a JSON string value.',
    sampleText: `{
  "name": "Pizza Margherita",
  "ingredients": [
    "tomato sauce",
    "mozzarella cheese",
    "fresh basil"
  ],
  "price": 12.50,
  "vegetarian": true
}`,
    sampleResult: `"{\\n  \\"name\\": \\"Pizza Margherita\\",\\n  \\"ingredients\\": [\\n    \\"tomato sauce\\",\\n    \\"mozzarella cheese\\",\\n    \\"fresh basil\\"\\n  ],\\n  \\"price\\": 12.50,\\n  \\"vegetarian\\": true\\n}"`,
    sampleOptions: {
      wrapInQuotesFlag: true
    }
  },
  {
    title: 'Escape a JSON Array',
    description:
      'This example shows that JSON arrays containing only numbers do not require escaping because they do not contain characters that need special handling.',
    sampleText: `[1, 2, 3]`,
    sampleResult: `[1, 2, 3]`,
    sampleOptions: {
      wrapInQuotesFlag: false
    }
  }
];

export default function EscapeJsonTool({ title }: ToolComponentProps) {
  const { t } = useTranslation('json');
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (options: InitialValuesType, input: string) => {
    setResult(escapeJson(input, options.wrapInQuotesFlag));
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: t('escapeJson.wrapOutputTitle'),
      component: (
        <Box>
          <CheckboxWithDesc
            onChange={(val) => updateField('wrapInQuotesFlag', val)}
            checked={values.wrapInQuotesFlag}
            title={t('escapeJson.wrapOutputTitle')}
            description={t('escapeJson.wrapOutputDescription')}
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
          title={t('escapeJson.inputTitle')}
          value={input}
          onChange={setInput}
          language="json"
        />
      }
      resultComponent={
        <ToolTextResult
          title={t('escapeJson.resultTitle')}
          value={result}
          keepSpecialCharacters
          extension="txt"
        />
      }
      initialValues={initialValues}
      getGroups={getGroups}
      toolInfo={{
        title: t('escapeJson.title'),
        description: t('escapeJson.longDescription')
      }}
      exampleCards={exampleCards}
      input={input}
      setInput={setInput}
      compute={compute}
    />
  );
}
