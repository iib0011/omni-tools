import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import ToolCodeInput from '@components/input/ToolCodeInput';
import ToolCodeResult from '@components/result/ToolCodeResult';
import { stringifyJson } from './service';
import { ToolComponentProps } from '@tools/defineTool';
import RadioWithTextField from '@components/options/RadioWithTextField';
import SimpleRadio from '@components/options/SimpleRadio';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import { updateNumberField } from '@utils/string';
import { CardExampleType } from '@components/examples/ToolExamples';
import { InitialValuesType } from './types';
import { useTranslation } from 'react-i18next';

const initialValues: InitialValuesType = {
  indentationType: 'space',
  spacesCount: 2,
  escapeHtml: false
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Simple Object to JSON',
    description: 'Convert a basic JavaScript object into a JSON string.',
    sampleText: `{ name: "John", age: 30 }`,
    sampleResult: `{
  "name": "John",
  "age": 30
}`,
    sampleOptions: {
      indentationType: 'space',
      spacesCount: 2,
      escapeHtml: false
    }
  },
  {
    title: 'Array with Mixed Types',
    description:
      'Convert an array containing different types of values into JSON.',
    sampleText: `[1, "hello", true, null, { x: 10 }]`,
    sampleResult: `[
    1,
    "hello",
    true,
    null,
    {
        "x": 10
    }
]`,
    sampleOptions: {
      indentationType: 'space',
      spacesCount: 4,
      escapeHtml: false
    }
  },
  {
    title: 'HTML-Escaped JSON',
    description: 'Convert an object to JSON with HTML characters escaped.',
    sampleText: `{
  html: "<div>Hello & Welcome</div>",
  message: "Special chars: < > & ' \\""
}`,
    sampleResult: `{
  &quot;html&quot;: &quot;&lt;div&gt;Hello &amp; Welcome&lt;/div&gt;&quot;,
  &quot;message&quot;: &quot;Special chars: &lt; &gt; &amp; &#039; &quot;&quot;
}`,
    sampleOptions: {
      indentationType: 'space',
      spacesCount: 2,
      escapeHtml: true
    }
  }
];

export default function StringifyJson({ title }: ToolComponentProps) {
  const { t } = useTranslation('json');
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (values: InitialValuesType, input: string) => {
    if (input) {
      try {
        setResult(stringifyJson(input, values));
      } catch (error) {
        setResult(
          `${error instanceof Error ? error.message : 'Invalid Json format'}`
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
          title={t('stringify.inputTitle')}
          value={input}
          onChange={setInput}
          language="json"
        />
      }
      resultComponent={
        <ToolCodeResult
          title={t('stringify.resultTitle')}
          value={result}
          language={'json'}
        />
      }
      getGroups={({ values, updateField }) => [
        {
          title: t('stringify.options.indentationTitle'),
          component: (
            <Box>
              <RadioWithTextField
                checked={values.indentationType === 'space'}
                title={t('stringify.options.useSpaceTitle')}
                fieldName="indentationType"
                description={t('stringify.options.useSpaceDesc')}
                value={values.spacesCount.toString()}
                onRadioClick={() => updateField('indentationType', 'space')}
                onTextChange={(val) =>
                  updateNumberField(val, 'spacesCount', updateField)
                }
              />
              <SimpleRadio
                onClick={() => updateField('indentationType', 'tab')}
                checked={values.indentationType === 'tab'}
                description="Indent output with tabs"
                title={t('stringify.options.useTabTitle')}
              />
            </Box>
          )
        },
        {
          title: t('stringify.options.optionsTitle'),
          component: (
            <CheckboxWithDesc
              checked={values.escapeHtml}
              onChange={(value) => updateField('escapeHtml', value)}
              title={t('stringify.options.escapeHtmlTitle')}
              description={t('stringify.options.escapeHtmlDesc')}
            />
          )
        }
      ]}
      toolInfo={{
        title: t('stringify.toolInfo.title'),
        description: t('stringify.toolInfo.description')
      }}
    />
  );
}
