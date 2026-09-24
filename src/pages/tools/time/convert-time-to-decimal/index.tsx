import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import { CardExampleType } from '@components/examples/ToolExamples';
import { convertTimeToDecimal } from './service';
import { InitialValuesType } from './types';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';

const initialValues: InitialValuesType = {
  decimalPlaces: '6'
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Convert time to decimal',
    description:
      'This example shows how to convert a formatted time (HH:MM:SS) to a decimal version.',
    sampleText: '31:23:59',
    sampleResult: `31.399722`,
    sampleOptions: {
      decimalPlaces: '6'
    }
  }
];
export default function ConvertTimeToDecimal({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (values: InitialValuesType, input: string) => {
    setResult(convertTimeToDecimal(input, values));
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: 'Decimal places',
      component: (
        <Box>
          <TextFieldWithDesc
            description={'How many decimal places should the result contain?'}
            value={values.decimalPlaces}
            onOwnChange={(val) => updateField('decimalPlaces', val)}
            type={'text'}
          />
        </Box>
      )
    }
  ];
  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={<ToolTextInput value={input} onChange={setInput} />}
      resultComponent={<ToolTextResult value={result} />}
      initialValues={initialValues}
      exampleCards={exampleCards}
      getGroups={getGroups}
      setInput={setInput}
      compute={compute}
      toolInfo={{ title: `What is a ${title}?`, description: longDescription }}
    />
  );
}
