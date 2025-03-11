import React, { useState } from 'react';
import { Box } from '@mui/material';
import ToolContent from '@components/ToolContent';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { rotateString } from './service';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import SimpleRadio from '@components/options/SimpleRadio';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';

interface InitialValuesType {
  step: string;
  direction: 'left' | 'right';
  multiLine: boolean;
}

const initialValues: InitialValuesType = {
  step: '1',
  direction: 'right',
  multiLine: true
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Rotate text to the right',
    description:
      'This example shows how to rotate text to the right by 2 positions.',
    sampleText: 'abcdef',
    sampleResult: 'efabcd',
    sampleOptions: {
      step: '2',
      direction: 'right',
      multiLine: false
    }
  },
  {
    title: 'Rotate text to the left',
    description:
      'This example shows how to rotate text to the left by 2 positions.',
    sampleText: 'abcdef',
    sampleResult: 'cdefab',
    sampleOptions: {
      step: '2',
      direction: 'left',
      multiLine: false
    }
  },
  {
    title: 'Rotate multi-line text',
    description:
      'This example shows how to rotate each line of a multi-line text.',
    sampleText: 'abcdef\nghijkl',
    sampleResult: 'fabcde\nlghijk',
    sampleOptions: {
      step: '1',
      direction: 'right',
      multiLine: true
    }
  }
];

export default function Rotate({ title }: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (optionsValues: InitialValuesType, input: string) => {
    if (input) {
      const step = parseInt(optionsValues.step, 10) || 1;
      const isRight = optionsValues.direction === 'right';
      setResult(rotateString(input, step, isRight, optionsValues.multiLine));
    }
  };

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: 'Rotation Options',
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.step}
            onOwnChange={(val) => updateField('step', val)}
            description={'Number of positions to rotate'}
            type="number"
          />
          <SimpleRadio
            onClick={() => updateField('direction', 'right')}
            checked={values.direction === 'right'}
            title={'Rotate Right'}
          />
          <SimpleRadio
            onClick={() => updateField('direction', 'left')}
            checked={values.direction === 'left'}
            title={'Rotate Left'}
          />
          <CheckboxWithDesc
            checked={values.multiLine}
            onChange={(checked) => updateField('multiLine', checked)}
            title={'Process as multi-line text (rotate each line separately)'}
          />
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      inputComponent={
        <ToolTextInput title="Input Text" value={input} onChange={setInput} />
      }
      resultComponent={<ToolTextResult title="Rotated Text" value={result} />}
      initialValues={initialValues}
      getGroups={getGroups}
      toolInfo={{
        title: 'String Rotation',
        description:
          'This tool allows you to rotate characters in a string by a specified number of positions. You can rotate to the left or right, and process multi-line text by rotating each line separately. String rotation is useful for simple text transformations, creating patterns, or implementing basic encryption techniques.'
      }}
      exampleCards={exampleCards}
      input={input}
      setInput={setInput}
      compute={compute}
    />
  );
}
