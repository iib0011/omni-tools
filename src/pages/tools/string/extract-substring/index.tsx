import React, { useState } from 'react';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import { extractSubstring } from './service';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import ToolContent from '@components/ToolContent';

const initialValues = {
  start: '1',
  length: '5',
  multiLine: false,
  reverse: false
};

const exampleCards: CardExampleType<typeof initialValues>[] = [
  {
    title: 'Extract First 5 Characters',
    description: 'This example extracts the first 5 characters from the text.',
    sampleText: 'The quick brown fox jumps over the lazy dog.',
    sampleResult: 'The q',
    sampleOptions: {
      ...initialValues,
      start: '1',
      length: '5'
    }
  },
  {
    title: 'Extract Words from the Middle',
    description:
      'Extract a substring starting from position 11 with a length of 10 characters.',
    sampleText: 'The quick brown fox jumps over the lazy dog.',
    sampleResult: 'brown fox',
    sampleOptions: {
      ...initialValues,
      start: '11',
      length: '10'
    }
  },
  {
    title: 'Multi-line Extraction with Reversal',
    description: 'Extract characters 1-3 from each line and reverse them.',
    sampleText: 'First line\nSecond line\nThird line',
    sampleResult: 'riF\nceS\nihT',
    sampleOptions: {
      ...initialValues,
      start: '1',
      length: '3',
      multiLine: true,
      reverse: true
    }
  }
];

export default function ExtractSubstring({ title }: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const computeExternal = (
    optionsValues: typeof initialValues,
    input: string
  ) => {
    const { start, length, multiLine, reverse } = optionsValues;
    try {
      setResult(
        extractSubstring(
          input,
          parseInt(start, 10),
          parseInt(length, 10),
          multiLine,
          reverse
        )
      );
    } catch (error) {
      if (error instanceof Error) {
        setResult(`Error: ${error.message}`);
      } else {
        setResult('An unknown error occurred');
      }
    }
  };

  const getGroups: GetGroupsType<typeof initialValues> = ({
    values,
    updateField
  }) => [
    {
      title: 'Extraction options',
      component: [
        <TextFieldWithDesc
          key="start"
          value={values.start}
          onOwnChange={(value) => updateField('start', value)}
          description="Start position (1-based index)"
          type="number"
        />,
        <TextFieldWithDesc
          key="length"
          value={values.length}
          onOwnChange={(value) => updateField('length', value)}
          description="Number of characters to extract"
          type="number"
        />,
        <CheckboxWithDesc
          key="multiLine"
          checked={values.multiLine}
          title="Process multi-line text"
          description="Extract from each line independently"
          onChange={(val) => updateField('multiLine', val)}
        />,
        <CheckboxWithDesc
          key="reverse"
          checked={values.reverse}
          title="Reverse output"
          description="Reverse the extracted substring"
          onChange={(val) => updateField('reverse', val)}
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
        <ToolTextResult title={'Extracted text'} value={result} />
      }
      exampleCards={exampleCards}
    />
  );
}
