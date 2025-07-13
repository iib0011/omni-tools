import React, { useState } from 'react';
import * as Yup from 'yup';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import ToolContent from '@components/ToolContent';
import { GetGroupsType } from '@components/options/ToolOptions';
import { mergeText } from './service';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const compute = (optionsValues: InitialValuesType, input: any) => {
    const { joinCharacter, deleteBlank, deleteTrailing } = optionsValues;
    setResult(mergeText(input, deleteBlank, deleteTrailing, joinCharacter));
  };

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: t('string.join.textMergedOptions'),
      component: (
        <TextFieldWithDesc
          placeholder={t('string.join.joinCharacterPlaceholder')}
          value={values['joinCharacter']}
          onOwnChange={(value) => updateField(mergeOptions.accessor, value)}
          description={t('string.join.joinCharacterDescription')}
        />
      )
    },
    {
      title: t('string.join.blankLinesAndTrailingSpaces'),
      component: blankTrailingOptions.map((option) => (
        <CheckboxWithDesc
          key={option.accessor}
          title={t(`string.join.${option.accessor}Title`)}
          checked={!!values[option.accessor]}
          onChange={(value) => updateField(option.accessor, value)}
          description={t(`string.join.${option.accessor}Description`)}
        />
      ))
    }
  ];
  return (
    <ToolContent
      title={title}
      initialValues={initialValues}
      compute={compute}
      input={input}
      setInput={setInput}
      inputComponent={
        <ToolTextInput
          title={t('string.join.inputTitle')}
          value={input}
          onChange={setInput}
        />
      }
      resultComponent={
        <ToolTextResult title={t('string.join.resultTitle')} value={result} />
      }
      getGroups={getGroups}
      toolInfo={{
        title: t('string.join.toolInfo.title'),
        description: t('string.join.toolInfo.description')
      }}
      exampleCards={exampleCards}
    />
  );
}
