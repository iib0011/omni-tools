import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolTextInput from '../../../components/input/ToolTextInput';
import ToolTextResult from '../../../components/result/ToolTextResult';
import * as Yup from 'yup';
import ToolOptions from '../../../components/options/ToolOptions';
import { compute } from './service';
import TextFieldWithDesc from '../../../components/options/TextFieldWithDesc';
import ToolInputAndResult from '../../../components/ToolInputAndResult';

const initialValues = {
  dotSymbol: '.',
  dashSymbol: '-'
};

export default function ToMorse() {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  // const formRef = useRef<FormikProps<typeof initialValues>>(null);
  const computeOptions = (optionsValues: typeof initialValues, input: any) => {
    const { dotSymbol, dashSymbol } = optionsValues;
    setResult(compute(input, dotSymbol, dashSymbol));
  };
  const validationSchema = Yup.object({
    // splitSeparator: Yup.string().required('The separator is required')
  });

  return (
    <Box>
      <ToolInputAndResult
        input={<ToolTextInput value={input} onChange={setInput} />}
        result={<ToolTextResult title={'Morse code'} value={result} />}
      />
      <ToolOptions
        compute={computeOptions}
        getGroups={({ values, setFieldValue }) => [
          {
            title: 'Short Signal',
            component: (
              <TextFieldWithDesc
                description={
                  'Symbol that will correspond to the dot in Morse code.'
                }
                value={values.dotSymbol}
                onOwnChange={(val) => setFieldValue('dotSymbol', val)}
              />
            )
          },
          {
            title: 'Long Signal',
            component: (
              <TextFieldWithDesc
                description={
                  'Symbol that will correspond to the dash in Morse code.'
                }
                value={values.dashSymbol}
                onOwnChange={(val) => setFieldValue('dashSymbol', val)}
              />
            )
          }
        ]}
        initialValues={initialValues}
        input={input}
        validationSchema={validationSchema}
      />
    </Box>
  );
}
