import React, { useEffect, useState } from 'react';
import ToolFileInput from '@components/input/ToolFileInput';
import ToolFileResult from '@components/result/ToolFileResult';
import { changeOpacity } from './service';
import ToolContent from '@components/ToolContent';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { updateNumberField } from '@utils/string';

type InitialValuesType = {
  opacity: number;
};

const initialValues: InitialValuesType = {
  opacity: 1
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Semi-transparent PNG',
    description: 'Make an image 50% transparent',
    sampleOptions: {
      opacity: 0.5
    },
    sampleResult: ''
  },
  {
    title: 'Slightly Faded PNG',
    description: 'Create a subtle transparency effect',
    sampleOptions: {
      opacity: 0.8
    },
    sampleResult: ''
  }
];

export default function ChangeOpacity({ title }: ToolComponentProps) {
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);

  const compute = (values: InitialValuesType, input: any) => {
    if (input) {
      changeOpacity(input, values.opacity).then(setResult);
    }
  };
  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <ToolFileInput
          value={input}
          onChange={setInput}
          accept={['image/png']}
          title={'Input PNG'}
        />
      }
      resultComponent={
        <ToolFileResult
          title={'Changed PNG'}
          value={result}
          extension={'png'}
        />
      }
      initialValues={initialValues}
      exampleCards={exampleCards}
      getGroups={({ values, updateField }) => [
        {
          title: 'Opacity Settings',
          component: (
            <TextFieldWithDesc
              description="Set opacity between 0 (transparent) and 1 (opaque)"
              value={values.opacity}
              onOwnChange={(val) =>
                updateNumberField(val, 'opacity', updateField)
              }
              type="number"
              inputProps={{ step: 0.1, min: 0, max: 1 }}
            />
          )
        }
      ]}
      compute={compute}
    />
  );
}
