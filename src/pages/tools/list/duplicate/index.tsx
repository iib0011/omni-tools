import React, { useState } from 'react';
import { Box } from '@mui/material';
import ToolContent from '@components/ToolContent';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { duplicateList, SplitOperatorType } from './service';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import SimpleRadio from '@components/options/SimpleRadio';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';

interface InitialValuesType {
  splitOperatorType: SplitOperatorType;
  splitSeparator: string;
  joinSeparator: string;
  concatenate: boolean;
  reverse: boolean;
  copy: string;
}

const initialValues: InitialValuesType = {
  splitOperatorType: 'symbol',
  splitSeparator: ' ',
  joinSeparator: ' ',
  concatenate: true,
  reverse: false,
  copy: '2'
};

const validationSchema = Yup.object({
  splitSeparator: Yup.string().required('The separator is required'),
  joinSeparator: Yup.string().required('The join separator is required'),
  copy: Yup.number()
    .typeError('Number of copies must be a number')
    .min(0.1, 'Number of copies must be positive')
    .required('Number of copies is required')
});

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Simple duplication',
    description: 'This example shows how to duplicate a list of words.',
    sampleText: 'Hello World',
    sampleResult: 'Hello World Hello World',
    sampleOptions: {
      splitOperatorType: 'symbol',
      splitSeparator: ' ',
      joinSeparator: ' ',
      concatenate: true,
      reverse: false,
      copy: '2'
    }
  },
  {
    title: 'Reverse duplication',
    description: 'This example shows how to duplicate a list in reverse order.',
    sampleText: 'Hello World',
    sampleResult: 'Hello World World Hello',
    sampleOptions: {
      splitOperatorType: 'symbol',
      splitSeparator: ' ',
      joinSeparator: ' ',
      concatenate: true,
      reverse: true,
      copy: '2'
    }
  },
  {
    title: 'Interweaving items',
    description:
      'This example shows how to interweave items instead of concatenating them.',
    sampleText: 'Hello World',
    sampleResult: 'Hello Hello World World',
    sampleOptions: {
      splitOperatorType: 'symbol',
      splitSeparator: ' ',
      joinSeparator: ' ',
      concatenate: false,
      reverse: false,
      copy: '2'
    }
  },
  {
    title: 'Fractional duplication',
    description:
      'This example shows how to duplicate a list with a fractional number of copies.',
    sampleText: 'apple banana cherry',
    sampleResult: 'apple banana cherry apple banana',
    sampleOptions: {
      splitOperatorType: 'symbol',
      splitSeparator: ' ',
      joinSeparator: ' ',
      concatenate: true,
      reverse: false,
      copy: '1.7'
    }
  }
];

export default function Duplicate({ title }: ToolComponentProps) {
  const { t } = useTranslation('list');
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (optionsValues: InitialValuesType, input: string) => {
    if (input) {
      try {
        const copy = parseFloat(optionsValues.copy);
        setResult(
          duplicateList(
            optionsValues.splitOperatorType,
            optionsValues.splitSeparator,
            optionsValues.joinSeparator,
            input,
            optionsValues.concatenate,
            optionsValues.reverse,
            copy
          )
        );
      } catch (error) {
        if (error instanceof Error) {
          setResult(`${t('duplicate.error')}: ${error.message}`);
        } else {
          setResult(t('duplicate.unknownError'));
        }
      }
    }
  };

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: t('duplicate.splitOptions'),
      component: (
        <Box>
          <SimpleRadio
            onClick={() => updateField('splitOperatorType', 'symbol')}
            checked={values.splitOperatorType === 'symbol'}
            title={t('duplicate.splitBySymbol')}
          />
          <SimpleRadio
            onClick={() => updateField('splitOperatorType', 'regex')}
            checked={values.splitOperatorType === 'regex'}
            title={t('duplicate.splitByRegex')}
          />
          <TextFieldWithDesc
            value={values.splitSeparator}
            onOwnChange={(val) => updateField('splitSeparator', val)}
            description={t('duplicate.splitSeparatorDescription')}
          />
          <TextFieldWithDesc
            value={values.joinSeparator}
            onOwnChange={(val) => updateField('joinSeparator', val)}
            description={t('duplicate.joinSeparatorDescription')}
          />
        </Box>
      )
    },
    {
      title: t('duplicate.duplicationOptions'),
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.copy}
            onOwnChange={(val) => updateField('copy', val)}
            description={t('duplicate.copyDescription')}
            type="number"
          />
          <CheckboxWithDesc
            title={t('duplicate.concatenate')}
            checked={values.concatenate}
            onChange={(checked) => updateField('concatenate', checked)}
            description={t('duplicate.concatenateDescription')}
          />
          <CheckboxWithDesc
            title={t('duplicate.reverse')}
            checked={values.reverse}
            onChange={(checked) => updateField('reverse', checked)}
            description={t('duplicate.reverseDescription')}
          />
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      inputComponent={
        <ToolTextInput
          title={t('duplicate.inputTitle')}
          value={input}
          onChange={setInput}
        />
      }
      resultComponent={
        <ToolTextResult title={t('duplicate.resultTitle')} value={result} />
      }
      initialValues={initialValues}
      getGroups={getGroups}
      validationSchema={validationSchema}
      toolInfo={{
        title: t('duplicate.toolInfo.title'),
        description: t('duplicate.toolInfo.description')
      }}
      exampleCards={exampleCards}
      input={input}
      setInput={setInput}
      compute={compute}
    />
  );
}
