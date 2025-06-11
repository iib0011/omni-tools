import React, { useState } from 'react';
import { Box } from '@mui/material';
import ToolContent from '@components/ToolContent';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { SplitOperatorType, truncateList } from './service';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import SimpleRadio from '@components/options/SimpleRadio';
import * as Yup from 'yup';

interface InitialValuesType {
  splitOperatorType: SplitOperatorType;
  splitSeparator: string;
  joinSeparator: string;
  end: boolean;
  length: string;
}

const initialValues: InitialValuesType = {
  splitOperatorType: 'symbol',
  splitSeparator: ',',
  joinSeparator: ',',
  end: true,
  length: '3'
};

const validationSchema = Yup.object({
  splitSeparator: Yup.string().required('The separator is required'),
  joinSeparator: Yup.string().required('The join separator is required'),
  length: Yup.number()
    .typeError('Length must be a number')
    .min(0, 'Length must be a positive number')
    .required('Length is required')
});

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Keep first 3 items in a list',
    description:
      'This example shows how to keep only the first 3 items in a comma-separated list.',
    sampleText: 'apple, pineapple, lemon, orange, mango',
    sampleResult: 'apple,pineapple,lemon',
    sampleOptions: {
      splitOperatorType: 'symbol',
      splitSeparator: ', ',
      joinSeparator: ',',
      end: true,
      length: '3'
    }
  },
  {
    title: 'Keep last 2 items in a list',
    description:
      'This example shows how to keep only the last 2 items in a comma-separated list.',
    sampleText: 'apple, pineapple, lemon, orange, mango',
    sampleResult: 'orange,mango',
    sampleOptions: {
      splitOperatorType: 'symbol',
      splitSeparator: ', ',
      joinSeparator: ',',
      end: false,
      length: '2'
    }
  },
  {
    title: 'Truncate a list with custom separators',
    description:
      'This example shows how to truncate a list with custom separators.',
    sampleText: 'apple | pineapple | lemon | orange | mango',
    sampleResult: 'apple - pineapple - lemon',
    sampleOptions: {
      splitOperatorType: 'symbol',
      splitSeparator: ' | ',
      joinSeparator: ' - ',
      end: true,
      length: '3'
    }
  }
];

export default function Truncate({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (optionsValues: InitialValuesType, input: string) => {
    if (input) {
      try {
        const length = parseInt(optionsValues.length, 10);
        setResult(
          truncateList(
            optionsValues.splitOperatorType,
            input,
            optionsValues.splitSeparator,
            optionsValues.joinSeparator,
            optionsValues.end,
            length
          )
        );
      } catch (error) {
        if (error instanceof Error) {
          setResult(`Error: ${error.message}`);
        } else {
          setResult('An unknown error occurred');
        }
      }
    }
  };

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: 'Split Options',
      component: (
        <Box>
          <SimpleRadio
            onClick={() => updateField('splitOperatorType', 'symbol')}
            checked={values.splitOperatorType === 'symbol'}
            title={'Split by Symbol'}
          />
          <SimpleRadio
            onClick={() => updateField('splitOperatorType', 'regex')}
            checked={values.splitOperatorType === 'regex'}
            title={'Split by Regular Expression'}
          />
          <TextFieldWithDesc
            value={values.splitSeparator}
            onOwnChange={(val) => updateField('splitSeparator', val)}
            description={'Separator to split the list'}
          />
          <TextFieldWithDesc
            value={values.joinSeparator}
            onOwnChange={(val) => updateField('joinSeparator', val)}
            description={'Separator to join the truncated list'}
          />
        </Box>
      )
    },
    {
      title: 'Truncation Options',
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.length}
            onOwnChange={(val) => updateField('length', val)}
            description={'Number of items to keep'}
            type="number"
          />
          <SimpleRadio
            onClick={() => updateField('end', true)}
            checked={values.end}
            title={'Keep items from the beginning'}
          />
          <SimpleRadio
            onClick={() => updateField('end', false)}
            checked={!values.end}
            title={'Keep items from the end'}
          />
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      inputComponent={
        <ToolTextInput title="Input List" value={input} onChange={setInput} />
      }
      resultComponent={<ToolTextResult title="Truncated List" value={result} />}
      initialValues={initialValues}
      getGroups={getGroups}
      validationSchema={validationSchema}
      toolInfo={{ title: title, description: longDescription }}
      exampleCards={exampleCards}
      input={input}
      setInput={setInput}
      compute={compute}
    />
  );
}
