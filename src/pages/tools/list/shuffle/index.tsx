import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import ToolContent from '@components/ToolContent';
import { shuffleList, SplitOperatorType } from './service';
import SimpleRadio from '@components/options/SimpleRadio';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { isNumber } from '@utils/string';

const initialValues = {
  splitOperatorType: 'symbol' as SplitOperatorType,
  splitSeparator: ',',
  joinSeparator: ',',
  length: ''
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

export default function Shuffle() {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const compute = (optionsValues: typeof initialValues, input: any) => {
    const { splitOperatorType, splitSeparator, joinSeparator, length } =
      optionsValues;

    setResult(
      shuffleList(
        splitOperatorType,
        input,
        splitSeparator,
        joinSeparator,
        isNumber(length) ? Number(length) : undefined
      )
    );
  };

  return (
    <ToolContent
      title="Shuffle"
      initialValues={initialValues}
      compute={compute}
      input={input}
      setInput={setInput}
      inputComponent={
        <ToolTextInput title={'Input list'} value={input} onChange={setInput} />
      }
      resultComponent={
        <ToolTextResult title={'Shuffled list'} value={result} />
      }
      getGroups={({ values, updateField }) => [
        {
          title: 'Input list separator',
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
          title: 'Shuffled List Length',
          component: (
            <Box>
              <TextFieldWithDesc
                description={'Output this many random items'}
                value={values.length}
                onOwnChange={(val) => updateField('length', val)}
              />
            </Box>
          )
        },
        {
          title: 'Shuffled List Separator',
          component: (
            <Box>
              <TextFieldWithDesc
                value={values.joinSeparator}
                onOwnChange={(value) => updateField('joinSeparator', value)}
                description={'Use this separator in the randomized list.'}
              />
            </Box>
          )
        }
      ]}
    />
  );
}
