import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { CardExampleType } from '@components/examples/ToolExamples';
import { GetGroupsType } from '@components/options/ToolOptions';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import { beautifyXml } from './service';
import { InitialValuesType } from './types';
import { useTranslation } from 'react-i18next';

const initialValues: InitialValuesType = {
  preserveAttributes: true
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Beautify XML',
    description: 'Beautify a compact XML string for readability.',
    sampleText: '<root><item>1</item><item>2</item></root>',
    sampleResult: `<root>\n  <item>1</item>\n  <item>2</item>\n</root>`,
    sampleOptions: { preserveAttributes: true }
  }
];

export default function XmlBeautifier({ title }: ToolComponentProps) {
  const { t } = useTranslation('xml');
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (values: InitialValuesType, input: string) => {
    if (!input || input.trim() == '') return;
    setResult(beautifyXml(input, values));
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: t('xmlBeautifier.options.title'),
      component: (
        <CheckboxWithDesc
          checked={values.preserveAttributes}
          onChange={(value) => updateField('preserveAttributes', value)}
          title={t('xmlBeautifier.options.preserveAttributesTitle')}
          description={t('xmlBeautifier.options.preserveAttributesDesc')}
        />
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <ToolTextInput
          title={t('xmlBeautifier.inputTitle')}
          value={input}
          onChange={setInput}
        />
      }
      resultComponent={
        <ToolTextResult
          title={t('xmlBeautifier.resultTitle')}
          value={result}
          extension="xml"
        />
      }
      initialValues={initialValues}
      exampleCards={exampleCards}
      getGroups={getGroups}
      setInput={setInput}
      compute={compute}
      toolInfo={{
        title: t('xmlBeautifier.toolInfo.title'),
        description: t('xmlBeautifier.toolInfo.description')
      }}
    />
  );
}
