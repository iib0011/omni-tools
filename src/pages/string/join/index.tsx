import { Box, Grid, Stack, Typography } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { Formik, useFormikContext } from 'formik';
import * as Yup from 'yup';
import ToolTextInput from '../../../components/input/ToolTextInput';
import ToolTextResult from '../../../components/result/ToolTextResult';
import ToolOptions from '../../../components/options/ToolOptions';
import { mergeText } from './service';
import { CustomSnackBarContext } from '../../../contexts/CustomSnackBarContext';
import TextFieldWithDesc from '../../../components/options/TextFieldWithDesc';
import CheckboxWithDesc from '../../../components/options/CheckboxWithDesc';
import ToolOptionGroups from '../../../components/options/ToolOptionGroups';
import ToolInputAndResult from '../../../components/ToolInputAndResult';

import Info from './Info';
import Separator from '../../../tools/Separator';
import AllTools from '../../../components/allTools/AllTools';
import Examples from '../../../components/examples/Examples';
import ColorSelector from '../../../components/options/ColorSelector';

const initialValues = {
  joinCharacter: '',
  deleteBlank: true,
  deleteTrailing: true
};

const validationSchema = Yup.object().shape({
  joinCharacter: Yup.string().required('Join character is required'),
  deleteBlank: Yup.boolean().required('Delete blank is required'),
  deleteTrailing: Yup.boolean().required('Delete trailing is required')
});

const mergeOptions = {
  placeholder: 'Join Character',
  description:
    'Symbol that connects broken\n' + 'pieces of text. (Space by default.)\n',
  accessor: 'joinCharacter' as keyof typeof initialValues
};

const blankTrailingOptions: {
  title: string;
  description: string;
  accessor: keyof typeof initialValues;
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

const exampleCards = [
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
    requiredOptions: {
      joinCharacter: 'and',
      deleteBlankLines: true,
      deleteTrailingSpaces: true
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
    requiredOptions: {
      joinCharacter: ',',
      deleteBlankLines: false,
      deleteTrailingSpaces: false
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
    requiredOptions: {
      joinCharacter: '',
      deleteBlankLines: false,
      deleteTrailingSpaces: false
    }
  }
];

export default function JoinText() {
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (optionsValues: typeof initialValues, input: any) => {
    const { joinCharacter, deleteBlank, deleteTrailing } = optionsValues;
    setResult(mergeText(input, deleteBlank, deleteTrailing, joinCharacter));
  };

  function changeInputResult(input: string, result: string) {
    setInput(input);
    setResult(result);

    const toolsElement = document.getElementById('tool');
    if (toolsElement) {
      toolsElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

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
        compute={compute}
        getGroups={({ values, setFieldValue }) => [
          {
            title: 'Text Merged Options',
            component: (
              <TextFieldWithDesc
                placeholder={mergeOptions.placeholder}
                value={values['joinCharacter']}
                onChange={(value) =>
                  setFieldValue(mergeOptions.accessor, value)
                }
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
                onChange={(value) => setFieldValue(option.accessor, value)}
                description={option.description}
              />
            ))
          }
        ]}
        initialValues={initialValues}
        input={input}
        validationSchema={validationSchema}
      />
      <Info
        title="What Is a Text Joiner?"
        description="With this tool you can join parts of the text together. It takes a list of text values, separated by newlines, and merges them together. You can set the character that will be placed between the parts of the combined text. Also, you can ignore all empty lines and remove spaces and tabs at the end of all lines. Textabulous!"
      />
      <Separator backgroundColor="#5581b5" margin="50px" />
      <Examples
        title="Text Joiner Examples"
        subtitle="Click to try!"
        exampleCards={exampleCards.map((card) => ({
          ...card,
          changeInputResult
        }))}
      />
    </Box>
  );
}
