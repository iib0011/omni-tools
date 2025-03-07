import { Box } from '@mui/material';
import { useState } from 'react';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import { repeatText } from './service';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import ToolTextInput from '@components/input/ToolTextInput';
import { initialValues, InitialValuesType } from './initialValues';
import ToolContent from '@components/ToolContent';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Repeat word five times',
    description: 'Repeats "Hello!" five times without any delimiter.',
    sampleText: 'Hello! ',
    sampleResult: 'Hello! Hello! Hello! Hello! Hello! ',
    sampleOptions: {
      textToRepeat: 'Hello! ',
      repeatAmount: '5',
      delimiter: ''
    }
  },
  {
    title: 'Repeat phrase with comma',
    description:
      'Repeats "Good job" three times, separated by commas and spaces.',
    sampleText: 'Good job',
    sampleResult: 'Good job, Good job, Good job',
    sampleOptions: {
      textToRepeat: 'Good job',
      repeatAmount: '3',
      delimiter: ', '
    }
  },
  {
    title: 'Repeat number with space',
    description: 'Repeats the number "42" four times, separated by spaces.',
    sampleText: '42',
    sampleResult: '42 42 42 42',
    sampleOptions: {
      textToRepeat: '42',
      repeatAmount: '4',
      delimiter: ' '
    }
  }
];

export default function Replacer({ title }: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  function compute(optionsValues: InitialValuesType, input: string) {
    setResult(repeatText(optionsValues, input));
  }

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: 'Text Repetitions',
      component: (
        <Box>
          <TextFieldWithDesc
            description={'Number of repetitions.'}
            placeholder="Number"
            value={values.repeatAmount}
            onOwnChange={(val) => updateField('repeatAmount', val)}
            type={'number'}
          />
        </Box>
      )
    },
    {
      title: 'Repetitions Delimiter',
      component: (
        <Box>
          <TextFieldWithDesc
            description={'Delimiter for output copies.'}
            placeholder="Delimiter"
            value={values.delimiter}
            onOwnChange={(val) => updateField('delimiter', val)}
            type={'text'}
          />
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      initialValues={initialValues}
      getGroups={getGroups}
      compute={compute}
      input={input}
      setInput={setInput}
      inputComponent={
        <ToolTextInput title={'Input text'} value={input} onChange={setInput} />
      }
      resultComponent={
        <ToolTextResult title={'Repeated text'} value={result} />
      }
      toolInfo={{
        title: 'Text Replacer',
        description:
          'This tool allows you to repeat a given text multiple times with an optional separator.'
      }}
      exampleCards={exampleCards}
    />
  );
}
