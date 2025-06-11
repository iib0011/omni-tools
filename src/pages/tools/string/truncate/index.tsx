import { Box } from '@mui/material';
import { useState } from 'react';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import { truncateText } from './service';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import ToolTextInput from '@components/input/ToolTextInput';
import { initialValues, InitialValuesType } from './initialValues';
import ToolContent from '@components/ToolContent';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import SimpleRadio from '@components/options/SimpleRadio';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Basic Truncation on the Right',
    description: 'Truncate text from the right side based on max length.',
    sampleText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    sampleResult: 'Lorem ipsum dolor...',
    sampleOptions: {
      ...initialValues,
      textToTruncate:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      maxLength: '20',
      truncationSide: 'right',
      addIndicator: true,
      indicator: '...'
    }
  },
  {
    title: 'Truncation on the Left with Indicator',
    description: 'Truncate text from the left side and add an indicator.',
    sampleText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    sampleResult: '...is dolor sit amet, consectetur adipiscing elit.',
    sampleOptions: {
      ...initialValues,
      textToTruncate:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      maxLength: '40',
      truncationSide: 'left',
      addIndicator: true,
      indicator: '...'
    }
  },
  {
    title: 'Multi-line Truncation with Indicator',
    description:
      'Truncate text line by line, adding an indicator to each line.',
    sampleText: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`,
    sampleResult: `Lorem ipsum dolor sit amet, consectetur...
Ut enim ad minim veniam, quis nostrud...
Duis aute irure dolor in reprehenderit...`,
    sampleOptions: {
      ...initialValues,
      textToTruncate: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`,
      maxLength: '50',
      lineByLine: true,
      addIndicator: true,
      indicator: '...'
    }
  }
];

export default function Truncate({
  title,
  longDescription
}: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  function compute(optionsValues: InitialValuesType, input: string) {
    setResult(truncateText(optionsValues, input));
  }

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: 'Truncation Side',
      component: (
        <Box>
          <SimpleRadio
            onClick={() => updateField('truncationSide', 'right')}
            checked={values.truncationSide === 'right'}
            title={'Right-side Truncation'}
            description={'Remove characters from the end of the text.'}
          />
          <SimpleRadio
            onClick={() => updateField('truncationSide', 'left')}
            checked={values.truncationSide === 'left'}
            title={'Left-side Truncation'}
            description={'Remove characters from the start of the text.'}
          />
        </Box>
      )
    },
    {
      title: 'Length and Lines',
      component: (
        <Box>
          <TextFieldWithDesc
            description={'Number of characters to leave in the text.'}
            placeholder="Number"
            value={values.maxLength}
            onOwnChange={(val) => updateField('maxLength', val)}
            type={'number'}
          />
          <CheckboxWithDesc
            onChange={(val) => updateField('lineByLine', val)}
            checked={values.lineByLine}
            title={'Line-by-line Truncating'}
            description={'Truncate each line separately.'}
          />
        </Box>
      )
    },
    {
      title: 'Suffix and Affix',
      component: (
        <Box>
          <CheckboxWithDesc
            onChange={(val) => updateField('addIndicator', val)}
            checked={values.addIndicator}
            title={'Add Truncation Indicator'}
            description={''}
          />
          <TextFieldWithDesc
            description={
              'Characters to add at the end (or start) of the text. Note: They count towards the length.'
            }
            placeholder="Characters"
            value={values.indicator}
            onOwnChange={(val) => updateField('indicator', val)}
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
        <ToolTextResult title={'Truncated text'} value={result} />
      }
      toolInfo={{ title: title, description: longDescription }}
      exampleCards={exampleCards}
    />
  );
}
