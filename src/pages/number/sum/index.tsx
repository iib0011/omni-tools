import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolTextInput from '../../../components/input/ToolTextInput';
import ToolTextResult from '../../../components/result/ToolTextResult';
import ToolOptions from '../../../components/options/ToolOptions';
import { compute, NumberExtractionType } from './service';
import RadioWithTextField from '../../../components/options/RadioWithTextField';
import SimpleRadio from '../../../components/options/SimpleRadio';
import CheckboxWithDesc from '../../../components/options/CheckboxWithDesc';
import ToolInputAndResult from '../../../components/ToolInputAndResult';

const initialValues = {
  extractionType: 'smart' as NumberExtractionType,
  separator: '\\n',
  printRunningSum: false
};
const extractionTypes: {
  title: string;
  description: string;
  type: NumberExtractionType;
  withTextField: boolean;
  textValueAccessor?: keyof typeof initialValues;
}[] = [
  {
    title: 'Smart sum',
    description: 'Auto detect numbers in the input.',
    type: 'smart',
    withTextField: false
  },
  {
    title: 'Number Delimiter',
    type: 'delimiter',
    description:
      'Input SeparatorCustomize the number separator here. (By default a line break.)',
    withTextField: true,
    textValueAccessor: 'separator'
  }
];

export default function SplitText() {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  return (
    <Box>
      <ToolInputAndResult
        input={<ToolTextInput value={input} onChange={setInput} />}
        result={<ToolTextResult title={'Total'} value={result} />}
      />
      <ToolOptions
        getGroups={({ values, updateField }) => [
          {
            title: 'Number extraction',
            component: extractionTypes.map(
              ({
                title,
                description,
                type,
                withTextField,
                textValueAccessor
              }) =>
                withTextField ? (
                  <RadioWithTextField
                    key={type}
                    checked={type === values.extractionType}
                    title={title}
                    fieldName={'extractionType'}
                    description={description}
                    value={
                      textValueAccessor
                        ? values[textValueAccessor].toString()
                        : ''
                    }
                    onRadioClick={() => updateField('extractionType', type)}
                    onTextChange={(val) =>
                      textValueAccessor
                        ? updateField(textValueAccessor, val)
                        : null
                    }
                  />
                ) : (
                  <SimpleRadio
                    key={title}
                    onClick={() => updateField('extractionType', type)}
                    checked={values.extractionType === type}
                    description={description}
                    title={title}
                  />
                )
            )
          },
          {
            title: 'Running Sum',
            component: (
              <CheckboxWithDesc
                title={'Print Running Sum'}
                description={"Display the sum as it's calculated step by step."}
                checked={values.printRunningSum}
                onChange={(value) => updateField('printRunningSum', value)}
              />
            )
          }
        ]}
        compute={(optionsValues, input) => {
          const { extractionType, printRunningSum, separator } = optionsValues;
          setResult(compute(input, extractionType, printRunningSum, separator));
        }}
        initialValues={initialValues}
        input={input}
      />
    </Box>
  );
}
