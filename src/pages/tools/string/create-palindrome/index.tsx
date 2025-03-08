import { Box } from '@mui/material';
import React, { useState, useRef } from 'react';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import ToolOptions, { GetGroupsType } from '@components/options/ToolOptions';
import { createPalindromeList } from './service';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import ToolInputAndResult from '@components/ToolInputAndResult';
import ToolExamples, {
  CardExampleType
} from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { FormikProps } from 'formik';

const initialValues = {
  lastChar: true,
  multiLine: false
};

const exampleCards: CardExampleType<typeof initialValues>[] = [
  {
    title: 'Create Simple Palindrome',
    description:
      'Creates a palindrome by repeating the text in reverse order, including the last character.',
    sampleText: 'level',
    sampleResult: 'levellevel',
    sampleOptions: {
      ...initialValues,
      lastChar: true
    }
  },
  {
    title: 'Create Palindrome Without Last Character Duplication',
    description:
      'Creates a palindrome without repeating the last character in the reverse part.',
    sampleText: 'radar',
    sampleResult: 'radarada',
    sampleOptions: {
      ...initialValues,
      lastChar: false
    }
  },
  {
    title: 'Multi-line Palindrome Creation',
    description: 'Creates palindromes for each line independently.',
    sampleText: 'mom\ndad\nwow',
    sampleResult: 'mommom\ndaddad\nwowwow',
    sampleOptions: {
      ...initialValues,
      lastChar: true,
      multiLine: true
    }
  }
];

export default function CreatePalindrome({ title }: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const formRef = useRef<FormikProps<typeof initialValues>>(null);

  const computeExternal = (
    optionsValues: typeof initialValues,
    input: string
  ) => {
    const { lastChar, multiLine } = optionsValues;
    setResult(createPalindromeList(input, lastChar, multiLine));
  };

  const getGroups: GetGroupsType<typeof initialValues> = ({
    values,
    updateField
  }) => [
    {
      title: 'Palindrome options',
      component: [
        <CheckboxWithDesc
          key="lastChar"
          checked={values.lastChar}
          title="Include last character"
          description="Repeat the last character in the reversed part"
          onChange={(val) => updateField('lastChar', val)}
        />,
        <CheckboxWithDesc
          key="multiLine"
          checked={values.multiLine}
          title="Process multi-line text"
          description="Create palindromes for each line independently"
          onChange={(val) => updateField('multiLine', val)}
        />
      ]
    }
  ];

  return (
    <Box>
      <ToolInputAndResult
        input={<ToolTextInput value={input} onChange={setInput} />}
        result={<ToolTextResult title={'Palindrome text'} value={result} />}
      />
      <ToolOptions
        compute={computeExternal}
        getGroups={getGroups}
        initialValues={initialValues}
        input={input}
      />
      <ToolExamples
        title={title}
        exampleCards={exampleCards}
        getGroups={getGroups}
        formRef={formRef}
        setInput={setInput}
      />
    </Box>
  );
}
