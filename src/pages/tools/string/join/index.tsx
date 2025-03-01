import { Box } from '@mui/material';
import React, { useRef, useState } from 'react';
import * as Yup from 'yup';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import ToolOptions, { GetGroupsType } from '@components/options/ToolOptions';
import { mergeText } from './service';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import ToolInputAndResult from '@components/ToolInputAndResult';

import ToolInfo from '@components/ToolInfo';
import Separator from '@components/Separator';
import ToolExamples, {
  CardExampleType
} from '@components/examples/ToolExamples';
import { FormikProps } from 'formik';
import { ToolComponentProps } from '@tools/defineTool';

const initialValues = {
  joinCharacter: '',
  deleteBlank: true,
  deleteTrailing: true
};
type InitialValuesType = typeof initialValues;
const validationSchema = Yup.object().shape({
  joinCharacter: Yup.string().required('Join character is required'),
  deleteBlank: Yup.boolean().required('Delete blank is required'),
  deleteTrailing: Yup.boolean().required('Delete trailing is required')
});

const mergeOptions = {
  placeholder: 'Join Character',
  description:
    'Symbol that connects broken\n' + 'pieces of text. (Space by default.)\n',
  accessor: 'joinCharacter' as keyof InitialValuesType
};

const blankTrailingOptions: {
  title: string;
  description: string;
  accessor: keyof InitialValuesType;
}[] = [
  {
    title: 'Delete Blank Lines',
    description: "Delete lines that don't have\n text symbols.\n",
    accessor: 'deleteBlank'
  },
  {
    title: 'Delete Trailing Spaces',
    description: 'Remove spaces and tabs at\n the end of the lines.\n',
    accessor: 'deleteTrailing'
  }
];

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Merge a To-Do List',
    description:
      "In this example, we merge a bullet point list into one sentence, separating each item by the word 'and'. We also remove all empty lines and trailing spaces. If we didn't remove the empty lines, then they'd be joined with the separator word, making the separator word appear multiple times. If we didn't remove the trailing tabs and spaces, then they'd create extra spacing in the joined text and it wouldn't look nice.",
    sampleText: `clean the house

go shopping
feed the cat

make dinner
build a rocket ship and fly away`,
    sampleResult: `clean the house and go shopping and feed the cat and make dinner and build a rocket ship and fly away`,
    sampleOptions: {
      joinCharacter: 'and',
      deleteBlank: true,
      deleteTrailing: true
    }
  },
  {
    title: 'Comma Separated List',
    description:
      'This example joins a column of words into a comma separated list of words.',
    sampleText: `computer
memory
processor
mouse
keyboard`,
    sampleResult: `computer, memory, processor, mouse, keyboard`,
    sampleOptions: {
      joinCharacter: ',',
      deleteBlank: false,
      deleteTrailing: false
    }
  },
  {
    title: 'Vertical Word to Horizontal',
    description:
      'This example rotates words from a vertical position to horizontal. An empty separator is used for this purpose.',
    sampleText: `T
e
x
t
a
b
u
l
o
u
s
!`,
    sampleResult: `Textabulous!`,
    sampleOptions: {
      joinCharacter: '',
      deleteBlank: false,
      deleteTrailing: false
    }
  }
];

export default function JoinText({ title }: ToolComponentProps) {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const formRef = useRef<FormikProps<InitialValuesType>>(null);
  const compute = (optionsValues: InitialValuesType, input: any) => {
    const { joinCharacter, deleteBlank, deleteTrailing } = optionsValues;
    setResult(mergeText(input, deleteBlank, deleteTrailing, joinCharacter));
  };

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: 'Text Merged Options',
      component: (
        <TextFieldWithDesc
          placeholder={mergeOptions.placeholder}
          value={values['joinCharacter']}
          onOwnChange={(value) => updateField(mergeOptions.accessor, value)}
          description={mergeOptions.description}
        />
      )
    },
    {
      title: 'Blank Lines and Trailing Spaces',
      component: blankTrailingOptions.map((option) => (
        <CheckboxWithDesc
          key={option.accessor}
          title={option.title}
          checked={!!values[option.accessor]}
          onChange={(value) => updateField(option.accessor, value)}
          description={option.description}
        />
      ))
    }
  ];
  return (
    <Box>
      <ToolInputAndResult
        input={
          <ToolTextInput
            title={'Text Pieces'}
            value={input}
            onChange={setInput}
          />
        }
        result={<ToolTextResult title={'Joined Text'} value={result} />}
      />
      <ToolOptions
        formRef={formRef}
        compute={compute}
        getGroups={getGroups}
        initialValues={initialValues}
        input={input}
      />
      <ToolInfo
        title="What Is a Text Joiner?"
        description="With this tool you can join parts of the text together. It takes a list of text values, separated by newlines, and merges them together. You can set the character that will be placed between the parts of the combined text. Also, you can ignore all empty lines and remove spaces and tabs at the end of all lines. Textabulous!"
      />
      <Separator backgroundColor="#5581b5" margin="50px" />
      <ToolExamples
        title={title}
        exampleCards={exampleCards}
        getGroups={getGroups}
        formRef={formRef}
        setInput={setInput}
      />
    </Box>
  );
}
