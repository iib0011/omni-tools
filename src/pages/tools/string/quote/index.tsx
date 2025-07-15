import React, { useState } from 'react';
import { Box } from '@mui/material';
import ToolContent from '@components/ToolContent';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { stringQuoter } from './service';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import { useTranslation } from 'react-i18next';

interface InitialValuesType {
  leftQuote: string;
  rightQuote: string;
  doubleQuotation: boolean;
  emptyQuoting: boolean;
  multiLine: boolean;
}

const initialValues: InitialValuesType = {
  leftQuote: '"',
  rightQuote: '"',
  doubleQuotation: false,
  emptyQuoting: true,
  multiLine: true
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Quote text with double quotes',
    description: 'This example shows how to quote text with double quotes.',
    sampleText: 'Hello World',
    sampleResult: '"Hello World"',
    sampleOptions: {
      leftQuote: '"',
      rightQuote: '"',
      doubleQuotation: false,
      emptyQuoting: true,
      multiLine: false
    }
  },
  {
    title: 'Quote multi-line text with single quotes',
    description:
      'This example shows how to quote multi-line text with single quotes.',
    sampleText: 'Hello\nWorld',
    sampleResult: "'Hello'\n'World'",
    sampleOptions: {
      leftQuote: "'",
      rightQuote: "'",
      doubleQuotation: false,
      emptyQuoting: true,
      multiLine: true
    }
  },
  {
    title: 'Quote with custom quotes',
    description: 'This example shows how to quote text with custom quotes.',
    sampleText: 'Hello World',
    sampleResult: '<<Hello World>>',
    sampleOptions: {
      leftQuote: '<<',
      rightQuote: '>>',
      doubleQuotation: false,
      emptyQuoting: true,
      multiLine: false
    }
  }
];

export default function Quote({ title }: ToolComponentProps) {
  const { t } = useTranslation('string');
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (optionsValues: InitialValuesType, input: string) => {
    if (input) {
      setResult(
        stringQuoter(
          input,
          optionsValues.leftQuote,
          optionsValues.rightQuote,
          optionsValues.doubleQuotation,
          optionsValues.emptyQuoting,
          optionsValues.multiLine
        )
      );
    }
  };

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: t('quote.quoteOptions'),
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.leftQuote}
            onOwnChange={(val) => updateField('leftQuote', val)}
            description={t('quote.leftQuoteDescription')}
          />
          <TextFieldWithDesc
            value={values.rightQuote}
            onOwnChange={(val) => updateField('rightQuote', val)}
            description={t('quote.rightQuoteDescription')}
          />
          <CheckboxWithDesc
            checked={values.doubleQuotation}
            onChange={(checked) => updateField('doubleQuotation', checked)}
            title={t('quote.allowDoubleQuotation')}
          />
          <CheckboxWithDesc
            checked={values.emptyQuoting}
            onChange={(checked) => updateField('emptyQuoting', checked)}
            title={t('quote.quoteEmptyLines')}
          />
          <CheckboxWithDesc
            checked={values.multiLine}
            onChange={(checked) => updateField('multiLine', checked)}
            title={t('quote.processAsMultiLine')}
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
          title={t('quote.inputTitle')}
          value={input}
          onChange={setInput}
        />
      }
      resultComponent={
        <ToolTextResult title={t('quote.resultTitle')} value={result} />
      }
      initialValues={initialValues}
      getGroups={getGroups}
      toolInfo={{
        title: t('quote.toolInfo.title'),
        description: t('quote.toolInfo.description')
      }}
      exampleCards={exampleCards}
      input={input}
      setInput={setInput}
      compute={compute}
    />
  );
}
