import { Box } from '@mui/material';
import React, { useState, useRef } from 'react';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import ToolOptions, { GetGroupsType } from '@components/options/ToolOptions';
import { stringReverser } from './service';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import ToolInputAndResult from '@components/ToolInputAndResult';
import ToolExamples, {
  CardExampleType
} from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { FormikProps } from 'formik';
import ToolContent from '@components/ToolContent';

const initialValues = {
  multiLine: true,
  emptyItems: false,
  trim: false
};

const exampleCards: CardExampleType<typeof initialValues>[] = [
  {
    title: 'Simple Text Reversal',
    description:
      'Reverses each character in the text. Perfect for creating mirror text.',
    sampleText: 'Hello World',
    sampleResult: 'dlroW olleH',
    sampleOptions: {
      ...initialValues,
      multiLine: false
    }
  },
  {
    title: 'Multi-line Reversal',
    description:
      'Reverses each line independently while preserving the line breaks.',
    sampleText: 'First line\nSecond line\nThird line',
    sampleResult: 'enil tsriF\nenil dnoceS\nenil drihT',
    sampleOptions: {
      ...initialValues,
      multiLine: true
    }
  },
  {
    title: 'Clean Reversed Text',
    description:
      'Trims whitespace and skips empty lines before reversing the text.',
    sampleText: '  Spaces removed  \n\nEmpty line skipped',
    sampleResult: 'devomer secapS\ndeppiks enil ytpmE',
    sampleOptions: {
      ...initialValues,
      multiLine: true,
      emptyItems: true,
      trim: true
    }
  }
];

export default function Reverse({ title }: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const computeExternal = (
    optionsValues: typeof initialValues,
    input: string
  ) => {
    const { multiLine, emptyItems, trim } = optionsValues;
    setResult(stringReverser(input, multiLine, emptyItems, trim));
  };

  const getGroups: GetGroupsType<typeof initialValues> = ({
    values,
    updateField
  }) => [
    {
      title: 'Reversal options',
      component: [
        <CheckboxWithDesc
          key="multiLine"
          checked={values.multiLine}
          title="Process multi-line text"
          description="Each line will be reversed independently"
          onChange={(val) => updateField('multiLine', val)}
        />,
        <CheckboxWithDesc
          key="emptyItems"
          checked={values.emptyItems}
          title="Skip empty lines"
          description="Empty lines will be removed from the output"
          onChange={(val) => updateField('emptyItems', val)}
        />,
        <CheckboxWithDesc
          key="trim"
          checked={values.trim}
          title="Trim whitespace"
          description="Remove leading and trailing whitespace from each line"
          onChange={(val) => updateField('trim', val)}
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
      inputComponent={<ToolTextInput value={input} onChange={setInput} />}
      resultComponent={
        <ToolTextResult title={'Reversed text'} value={result} />
      }
      exampleCards={exampleCards}
    />
  );
}
