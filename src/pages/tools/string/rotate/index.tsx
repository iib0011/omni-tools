import React, { useState } from 'react';
import { Box } from '@mui/material';
import ToolContent from '@components/ToolContent';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { rotateString } from './service';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import SimpleRadio from '@components/options/SimpleRadio';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import { useTranslation } from 'react-i18next';

interface InitialValuesType {
  step: string;
  direction: 'left' | 'right';
  multiLine: boolean;
}

const initialValues: InitialValuesType = {
  step: '1',
  direction: 'right',
  multiLine: true
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Rotate text to the right',
    description:
      'This example shows how to rotate text to the right by 2 positions.',
    sampleText: 'abcdef',
    sampleResult: 'efabcd',
    sampleOptions: {
      step: '2',
      direction: 'right',
      multiLine: false
    }
  },
  {
    title: 'Rotate text to the left',
    description:
      'This example shows how to rotate text to the left by 2 positions.',
    sampleText: 'abcdef',
    sampleResult: 'cdefab',
    sampleOptions: {
      step: '2',
      direction: 'left',
      multiLine: false
    }
  },
  {
    title: 'Rotate multi-line text',
    description:
      'This example shows how to rotate each line of a multi-line text.',
    sampleText: 'abcdef\nghijkl',
    sampleResult: 'fabcde\nlghijk',
    sampleOptions: {
      step: '1',
      direction: 'right',
      multiLine: true
    }
  }
];

export default function Rotate({ title }: ToolComponentProps) {
  const { t } = useTranslation('string');
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (optionsValues: InitialValuesType, input: string) => {
    if (input) {
      const step = parseInt(optionsValues.step, 10) || 1;
      const isRight = optionsValues.direction === 'right';
      setResult(rotateString(input, step, isRight, optionsValues.multiLine));
    }
  };

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: t('rotate.rotationOptions'),
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.step}
            onOwnChange={(val) => updateField('step', val)}
            description={t('rotate.stepDescription')}
            type="number"
          />
          <SimpleRadio
            onClick={() => updateField('direction', 'right')}
            checked={values.direction === 'right'}
            title={t('rotate.rotateRight')}
          />
          <SimpleRadio
            onClick={() => updateField('direction', 'left')}
            checked={values.direction === 'left'}
            title={t('rotate.rotateLeft')}
          />
          <CheckboxWithDesc
            checked={values.multiLine}
            onChange={(checked) => updateField('multiLine', checked)}
            title={t('rotate.processAsMultiLine')}
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
          title={t('rotate.inputTitle')}
          value={input}
          onChange={setInput}
        />
      }
      resultComponent={
        <ToolTextResult title={t('rotate.resultTitle')} value={result} />
      }
      initialValues={initialValues}
      getGroups={getGroups}
      toolInfo={{
        title: t('rotate.toolInfo.title'),
        description: t('rotate.toolInfo.description')
      }}
      exampleCards={exampleCards}
      input={input}
      setInput={setInput}
      compute={compute}
    />
  );
}
