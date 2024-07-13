import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolTextInput from '../../../components/input/ToolTextInput';
import ToolTextResult from '../../../components/result/ToolTextResult';
import * as Yup from 'yup';
import ToolOptions from '../../../components/options/ToolOptions';
import { compute, SplitOperatorType } from './service';
import RadioWithTextField from '../../../components/options/RadioWithTextField';
import TextFieldWithDesc from '../../../components/options/TextFieldWithDesc';
import ToolInputAndResult from '../../../components/ToolInputAndResult';

const initialValues = {
  splitSeparatorType: 'symbol' as SplitOperatorType,
  symbolValue: ' ',
  regexValue: '/\\s+/',
  lengthValue: '16',
  chunksValue: '4',

  outputSeparator: '\\n',
  charBeforeChunk: '',
  charAfterChunk: ''
};
const splitOperators: {
  title: string;
  description: string;
  type: SplitOperatorType;
}[] = [
  {
    title: 'Use a Symbol for Splitting',
    description:
      'Character that will be used to\n' +
      'break text into parts.\n' +
      '(Space by default.)',
    type: 'symbol'
  },
  {
    title: 'Use a Regex for Splitting',
    type: 'regex',
    description:
      'Regular expression that will be\n' +
      'used to break text into parts.\n' +
      '(Multiple spaces by default.)'
  },
  {
    title: 'Use Length for Splitting',
    description:
      'Number of symbols that will be\n' + 'put in each output chunk.',
    type: 'length'
  },
  {
    title: 'Use a Number of Chunks',
    description: 'Number of chunks of equal\n' + 'length in the output.',
    type: 'chunks'
  }
];
const outputOptions: {
  description: string;
  accessor: keyof typeof initialValues;
}[] = [
  {
    description:
      'Character that will be put\n' +
      'between the split chunks.\n' +
      '(It\'s newline "\\n" by default.)',
    accessor: 'outputSeparator'
  },
  {
    description: 'Character before each chunk',
    accessor: 'charBeforeChunk'
  },
  {
    description: 'Character after each chunk',
    accessor: 'charAfterChunk'
  }
];

export default function SplitText() {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  // const formRef = useRef<FormikProps<typeof initialValues>>(null);
  const computeExternal = (optionsValues: typeof initialValues, input: any) => {
    const {
      splitSeparatorType,
      outputSeparator,
      charBeforeChunk,
      charAfterChunk,
      chunksValue,
      symbolValue,
      regexValue,
      lengthValue
    } = optionsValues;

    setResult(
      compute(
        splitSeparatorType,
        input,
        symbolValue,
        regexValue,
        Number(lengthValue),
        Number(chunksValue),
        charBeforeChunk,
        charAfterChunk,
        outputSeparator
      )
    );
  };

  return (
    <Box>
      <ToolInputAndResult
        input={<ToolTextInput value={input} onChange={setInput} />}
        result={<ToolTextResult title={'Text pieces'} value={result} />}
      />
      <ToolOptions
        compute={computeExternal}
        getGroups={({ values, updateField }) => [
          {
            title: 'Split separator options',
            component: splitOperators.map(({ title, description, type }) => (
              <RadioWithTextField
                key={type}
                checked={type === values.splitSeparatorType}
                title={title}
                fieldName={'splitSeparatorType'}
                description={description}
                value={values[`${type}Value`]}
                onRadioClick={() => updateField('splitSeparatorType', type)}
                onTextChange={(val) => updateField(`${type}Value`, val)}
              />
            ))
          },
          {
            title: 'Output separator options',
            component: outputOptions.map((option) => (
              <TextFieldWithDesc
                key={option.accessor}
                value={values[option.accessor]}
                onOwnChange={(value) => updateField(option.accessor, value)}
                description={option.description}
              />
            ))
          }
        ]}
        initialValues={initialValues}
        input={input}
      />
    </Box>
  );
}
