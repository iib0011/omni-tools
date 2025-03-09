import React, { useState } from 'react';
import { Box } from '@mui/material';
import ToolContent from '@components/ToolContent';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { SplitOperatorType, unwrapList } from './service';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import SimpleRadio from '@components/options/SimpleRadio';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import * as Yup from 'yup';

interface InitialValuesType {
  splitOperatorType: SplitOperatorType;
  splitSeparator: string;
  joinSeparator: string;
  deleteEmptyItems: boolean;
  multiLevel: boolean;
  trimItems: boolean;
  left: string;
  right: string;
}

const initialValues: InitialValuesType = {
  splitOperatorType: 'symbol',
  splitSeparator: '\n',
  joinSeparator: '\n',
  deleteEmptyItems: true,
  multiLevel: true,
  trimItems: true,
  left: '',
  right: ''
};

const validationSchema = Yup.object({
  splitSeparator: Yup.string().required('The separator is required'),
  joinSeparator: Yup.string().required('The join separator is required')
});

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Unwrap quotes from list items',
    description:
      'This example shows how to remove quotes from each item in a list.',
    sampleText: '"apple"\n"banana"\n"orange"',
    sampleResult: 'apple\nbanana\norange',
    sampleOptions: {
      splitOperatorType: 'symbol',
      splitSeparator: '\n',
      joinSeparator: '\n',
      deleteEmptyItems: true,
      multiLevel: true,
      trimItems: true,
      left: '"',
      right: '"'
    }
  },
  {
    title: 'Unwrap multiple levels of characters',
    description:
      'This example shows how to remove multiple levels of the same character from each item.',
    sampleText: '###Hello###\n##World##\n#Test#',
    sampleResult: 'Hello\nWorld\nTest',
    sampleOptions: {
      splitOperatorType: 'symbol',
      splitSeparator: '\n',
      joinSeparator: '\n',
      deleteEmptyItems: true,
      multiLevel: true,
      trimItems: true,
      left: '#',
      right: '#'
    }
  },
  {
    title: 'Unwrap and join with custom separator',
    description:
      'This example shows how to unwrap items and join them with a custom separator.',
    sampleText: '[item1]\n[item2]\n[item3]',
    sampleResult: 'item1, item2, item3',
    sampleOptions: {
      splitOperatorType: 'symbol',
      splitSeparator: '\n',
      joinSeparator: ', ',
      deleteEmptyItems: true,
      multiLevel: false,
      trimItems: true,
      left: '[',
      right: ']'
    }
  }
];

export default function Unwrap({ title }: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (optionsValues: InitialValuesType, input: string) => {
    if (input) {
      try {
        setResult(
          unwrapList(
            optionsValues.splitOperatorType,
            input,
            optionsValues.splitSeparator,
            optionsValues.joinSeparator,
            optionsValues.deleteEmptyItems,
            optionsValues.multiLevel,
            optionsValues.trimItems,
            optionsValues.left,
            optionsValues.right
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
            description={'Separator to join the unwrapped list'}
          />
        </Box>
      )
    },
    {
      title: 'Unwrap Options',
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.left}
            onOwnChange={(val) => updateField('left', val)}
            description={'Characters to remove from the left side'}
          />
          <TextFieldWithDesc
            value={values.right}
            onOwnChange={(val) => updateField('right', val)}
            description={'Characters to remove from the right side'}
          />
          <CheckboxWithDesc
            checked={values.multiLevel}
            onChange={(checked) => updateField('multiLevel', checked)}
            title={'Remove multiple levels of wrapping'}
          />
          <CheckboxWithDesc
            checked={values.trimItems}
            onChange={(checked) => updateField('trimItems', checked)}
            title={'Trim whitespace from items'}
          />
          <CheckboxWithDesc
            checked={values.deleteEmptyItems}
            onChange={(checked) => updateField('deleteEmptyItems', checked)}
            title={'Remove empty items'}
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
      resultComponent={<ToolTextResult title="Unwrapped List" value={result} />}
      initialValues={initialValues}
      getGroups={getGroups}
      validationSchema={validationSchema}
      toolInfo={{
        title: 'List Unwrapping',
        description:
          "This tool allows you to remove wrapping characters from each item in a list. You can specify characters to remove from the left and right sides, handle multiple levels of wrapping, and control how the list is processed. It's useful for cleaning up data, removing quotes or brackets, and formatting lists."
      }}
      exampleCards={exampleCards}
      input={input}
      setInput={setInput}
      compute={compute}
    />
  );
}
