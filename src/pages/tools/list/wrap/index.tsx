import React, { useState } from 'react';
import { Box } from '@mui/material';
import ToolContent from '@components/ToolContent';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { SplitOperatorType, wrapList } from './service';
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
  deleteEmptyItems: boolean;
  left: string;
  right: string;
}

const initialValues: InitialValuesType = {
  splitOperatorType: 'symbol',
  splitSeparator: ',',
  joinSeparator: ',',
  deleteEmptyItems: true,
  left: '"',
  right: '"'
};

const validationSchema = Yup.object({
  splitSeparator: Yup.string().required('The separator is required'),
  joinSeparator: Yup.string().required('The join separator is required')
});

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Wrap list items with quotes',
    description:
      'This example shows how to wrap each item in a list with quotes.',
    sampleText: 'apple,banana,orange',
    sampleResult: '"apple","banana","orange"',
    sampleOptions: {
      splitOperatorType: 'symbol',
      splitSeparator: ',',
      joinSeparator: ',',
      deleteEmptyItems: true,
      left: '"',
      right: '"'
    }
  },
  {
    title: 'Wrap list items with brackets',
    description:
      'This example shows how to wrap each item in a list with brackets.',
    sampleText: 'item1,item2,item3',
    sampleResult: '[item1],[item2],[item3]',
    sampleOptions: {
      splitOperatorType: 'symbol',
      splitSeparator: ',',
      joinSeparator: ',',
      deleteEmptyItems: true,
      left: '[',
      right: ']'
    }
  },
  {
    title: 'Wrap list items with custom text',
    description:
      'This example shows how to wrap each item with different text on each side.',
    sampleText: 'apple,banana,orange',
    sampleResult:
      'prefix-apple-suffix,prefix-banana-suffix,prefix-orange-suffix',
    sampleOptions: {
      splitOperatorType: 'symbol',
      splitSeparator: ',',
      joinSeparator: ',',
      deleteEmptyItems: true,
      left: 'prefix-',
      right: '-suffix'
    }
  }
];

export default function Wrap({ title }: ToolComponentProps) {
  const { t } = useTranslation('list');
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (optionsValues: InitialValuesType, input: string) => {
    if (input) {
      try {
        setResult(
          wrapList(
            optionsValues.splitOperatorType,
            input,
            optionsValues.splitSeparator,
            optionsValues.joinSeparator,
            optionsValues.deleteEmptyItems,
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
      title: t('wrap.splitOptions'),
      component: (
        <Box>
          <SimpleRadio
            onClick={() => updateField('splitOperatorType', 'symbol')}
            checked={values.splitOperatorType === 'symbol'}
            title={t('wrap.splitBySymbol')}
          />
          <SimpleRadio
            onClick={() => updateField('splitOperatorType', 'regex')}
            checked={values.splitOperatorType === 'regex'}
            title={t('wrap.splitByRegex')}
          />
          <TextFieldWithDesc
            value={values.splitSeparator}
            onOwnChange={(val) => updateField('splitSeparator', val)}
            description={t('wrap.splitSeparatorDescription')}
          />
          <TextFieldWithDesc
            value={values.joinSeparator}
            onOwnChange={(val) => updateField('joinSeparator', val)}
            description={t('wrap.joinSeparatorDescription')}
          />
          <CheckboxWithDesc
            checked={values.deleteEmptyItems}
            onChange={(checked) => updateField('deleteEmptyItems', checked)}
            title={t('wrap.removeEmptyItems')}
          />
        </Box>
      )
    },
    {
      title: t('wrap.wrapOptions'),
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.left}
            onOwnChange={(val) => updateField('left', val)}
            description={t('wrap.leftTextDescription')}
          />
          <TextFieldWithDesc
            value={values.right}
            onOwnChange={(val) => updateField('right', val)}
            description={t('wrap.rightTextDescription')}
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
          title={t('wrap.inputTitle')}
          value={input}
          onChange={setInput}
        />
      }
      resultComponent={
        <ToolTextResult title={t('wrap.resultTitle')} value={result} />
      }
      initialValues={initialValues}
      getGroups={getGroups}
      validationSchema={validationSchema}
      toolInfo={{
        title: t('wrap.toolInfo.title'),
        description: t('wrap.toolInfo.description')
      }}
      exampleCards={exampleCards}
      input={input}
      setInput={setInput}
      compute={compute}
    />
  );
}
