import ToolContent from '@components/ToolContent';
import React, { useState } from 'react';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { compute } from './service';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';

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

  return (
    <ToolContent
      title="To Morse"
      initialValues={initialValues}
      compute={computeOptions}
      input={input}
      setInput={setInput}
      inputComponent={<ToolTextInput value={input} onChange={setInput} />}
      resultComponent={<ToolTextResult title={'Morse code'} value={result} />}
      getGroups={({ values, updateField }) => [
        {
          title: 'Short Signal',
          component: (
            <TextFieldWithDesc
              description={
                'Symbol that will correspond to the dot in Morse code.'
              }
              value={values.dotSymbol}
              onOwnChange={(val) => updateField('dotSymbol', val)}
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
              onOwnChange={(val) => updateField('dashSymbol', val)}
            />
          )
        }
      ]}
    />
  );
}
