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
import { useTranslation } from 'react-i18next';

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

export default function Truncate({ title }: ToolComponentProps) {
  const { t } = useTranslation();
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
      title: t('string:truncate.truncationSide'),
      component: (
        <Box>
          <SimpleRadio
            onClick={() => updateField('truncationSide', 'right')}
            checked={values.truncationSide === 'right'}
            title={t('string:truncate.rightSideTruncation')}
            description={t('string:truncate.rightSideDescription')}
          />
          <SimpleRadio
            onClick={() => updateField('truncationSide', 'left')}
            checked={values.truncationSide === 'left'}
            title={t('string:truncate.leftSideTruncation')}
            description={t('string:truncate.leftSideDescription')}
          />
        </Box>
      )
    },
    {
      title: t('string:truncate.lengthAndLines'),
      component: (
        <Box>
          <TextFieldWithDesc
            description={t('string:truncate.maxLengthDescription')}
            placeholder={t('string:truncate.numberPlaceholder')}
            value={values.maxLength}
            onOwnChange={(val) => updateField('maxLength', val)}
            type={'number'}
          />
          <CheckboxWithDesc
            onChange={(val) => updateField('lineByLine', val)}
            checked={values.lineByLine}
            title={t('string:truncate.lineByLineTruncating')}
            description={t('string:truncate.lineByLineDescription')}
          />
        </Box>
      )
    },
    {
      title: t('string:truncate.suffixAndAffix'),
      component: (
        <Box>
          <CheckboxWithDesc
            onChange={(val) => updateField('addIndicator', val)}
            checked={values.addIndicator}
            title={t('string:truncate.addTruncationIndicator')}
            description={''}
          />
          <TextFieldWithDesc
            description={t('string:truncate.indicatorDescription')}
            placeholder={t('string:truncate.charactersPlaceholder')}
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
        <ToolTextInput
          title={t('string:truncate.inputTitle')}
          value={input}
          onChange={setInput}
        />
      }
      resultComponent={
        <ToolTextResult
          title={t('string:truncate.resultTitle')}
          value={result}
        />
      }
      toolInfo={{
        title: t('string:truncate.toolInfo.title'),
        description: t('string:truncate.toolInfo.description')
      }}
      exampleCards={exampleCards}
    />
  );
}
