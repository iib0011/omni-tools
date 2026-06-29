import React, { useState } from 'react';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import { extractEmails } from './service';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import ToolContent from '@components/ToolContent';

const initialValues = {
  unique: true
};

const exampleCards: CardExampleType<typeof initialValues>[] = [
  {
    title: 'Extract Emails from Text',
    description: 'Extract all email addresses from a block of text.',
    sampleText:
      'Contact us at support@example.com or sales@example.org for more info. You can also reach john.doe@company.co.uk.',
    sampleResult:
      'support@example.com\nsales@example.org\njohn.doe@company.co.uk',
    sampleOptions: { ...initialValues }
  },
  {
    title: 'Duplicate Removal',
    description:
      'When "Unique results only" is enabled, duplicate emails are removed.',
    sampleText: 'admin@test.com, admin@test.com, user@test.com',
    sampleResult: 'admin@test.com\nuser@test.com',
    sampleOptions: { ...initialValues }
  }
];

export default function EmailExtractor({ title }: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const computeExternal = (
    optionsValues: typeof initialValues,
    input: string
  ) => {
    const { unique } = optionsValues;
    setResult(extractEmails(input, unique));
  };

  const getGroups: GetGroupsType<typeof initialValues> = ({
    values,
    updateField
  }) => [
    {
      title: 'Extraction options',
      component: [
        <CheckboxWithDesc
          key="unique"
          checked={values.unique}
          title="Unique results only"
          description="Remove duplicate email addresses from the output"
          onChange={(val) => updateField('unique', val)}
        />
      ]
    }
  ];

  return (
    <ToolContent
      title={title}
      initialValues={initialValues}
      getGroups={getGroups}
      compute={computeExternal}
      input={input}
      setInput={setInput}
      inputComponent={
        <ToolTextInput title={'Input text'} value={input} onChange={setInput} />
      }
      resultComponent={
        <ToolTextResult title={'Extracted emails'} value={result} />
      }
      exampleCards={exampleCards}
    />
  );
}
