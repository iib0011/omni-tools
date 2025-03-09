import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolTextResult from '@components/result/ToolTextResult';
import { listOfIntegers } from './service';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';

const initialValues = {
  firstValue: '1',
  numberOfNumbers: '10',
  step: '1',
  separator: '\\n'
};

export default function GenerateNumbers({ title }: ToolComponentProps) {
  const [result, setResult] = useState<string>('');

  const compute = (optionsValues: typeof initialValues) => {
    const { firstValue, numberOfNumbers, separator, step } = optionsValues;
    setResult(
      listOfIntegers(
        Number(firstValue),
        Number(numberOfNumbers),
        Number(step),
        separator
      )
    );
  };

  return (
    <ToolContent
      title={title}
      initialValues={initialValues}
      getGroups={({ values, updateField }) => [
        {
          title: 'Arithmetic sequence option',
          component: (
            <Box>
              <TextFieldWithDesc
                description={'Start sequence from this number.'}
                value={values.firstValue}
                onOwnChange={(val) => updateField('firstValue', val)}
                type={'number'}
              />
              <TextFieldWithDesc
                description={'Increase each element by this amount'}
                value={values.step}
                onOwnChange={(val) => updateField('step', val)}
                type={'number'}
              />
              <TextFieldWithDesc
                description={'Number of elements in sequence.'}
                value={values.numberOfNumbers}
                onOwnChange={(val) => updateField('numberOfNumbers', val)}
                type={'number'}
              />
            </Box>
          )
        },
        {
          title: 'Separator',
          component: (
            <TextFieldWithDesc
              description={
                'Separate elements in the arithmetic sequence by this character.'
              }
              value={values.separator}
              onOwnChange={(val) => updateField('separator', val)}
            />
          )
        }
      ]}
      compute={compute}
      resultComponent={
        <ToolTextResult title={'Generated numbers'} value={result} />
      }
    />
  );
}
