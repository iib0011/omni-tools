import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { rotateList, SplitOperatorType } from './service';
import SimpleRadio from '@components/options/SimpleRadio';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { formatNumber } from '../../../../utils/number';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';

const initialValues = {
  splitOperatorType: 'symbol' as SplitOperatorType,
  input: '',
  splitSeparator: ',',
  joinSeparator: ',',
  right: true,
  step: 1
};
const splitOperators: {
  title: string;
  description: string;
  type: SplitOperatorType;
}[] = [
  {
    title: 'Use a Symbol for Splitting',
    description: 'Delimit input list items with a character.',
    type: 'symbol'
  },
  {
    title: 'Use a Regex for Splitting',
    type: 'regex',
    description: 'Delimit input list items with a regular expression.'
  }
];
const rotationDirections: {
  title: string;
  description: string;
  value: boolean;
}[] = [
  {
    title: 'Rotate forward',
    description:
      'Rotate list items to the right. (Down if a vertical column list.)',
    value: true
  },
  {
    title: 'Rotate backward',
    description:
      'Rotate list items to the left. (Up if a vertical column list.)',
    value: false
  }
];

export default function Rotate({ title }: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const compute = (optionsValues: typeof initialValues, input: any) => {
    const { splitOperatorType, splitSeparator, joinSeparator, right, step } =
      optionsValues;

    setResult(
      rotateList(
        splitOperatorType,
        input,
        splitSeparator,
        joinSeparator,
        right,
        step
      )
    );
  };

  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <ToolTextInput title={'Input list'} value={input} onChange={setInput} />
      }
      resultComponent={<ToolTextResult title={'Rotated list'} value={result} />}
      initialValues={initialValues}
      getGroups={({ values, updateField }) => [
        {
          title: 'Item split mode',
          component: (
            <Box>
              {splitOperators.map(({ title, description, type }) => (
                <SimpleRadio
                  key={type}
                  onClick={() => updateField('splitOperatorType', type)}
                  title={title}
                  description={description}
                  checked={values.splitOperatorType === type}
                />
              ))}
              <TextFieldWithDesc
                description={'Set a delimiting symbol or regular expression.'}
                value={values.splitSeparator}
                onOwnChange={(val) => updateField('splitSeparator', val)}
              />
            </Box>
          )
        },
        {
          title: 'Rotation Direction and Count',
          component: (
            <Box>
              {rotationDirections.map(({ title, description, value }) => (
                <SimpleRadio
                  key={`${value}`}
                  onClick={() => updateField('right', value)}
                  title={title}
                  description={description}
                  checked={values.right === value}
                />
              ))}
              <TextFieldWithDesc
                description={'Number of items to rotate'}
                value={values.step}
                onOwnChange={(val) => updateField('step', formatNumber(val, 1))}
              />
            </Box>
          )
        },
        {
          title: 'Rotated List Joining Symbol',
          component: (
            <Box>
              <TextFieldWithDesc
                value={values.joinSeparator}
                onOwnChange={(value) => updateField('joinSeparator', value)}
                description={
                  'Enter the character that goes between items in the rotated list.'
                }
              />
            </Box>
          )
        }
      ]}
      compute={compute}
      setInput={setInput}
    />
  );
}
