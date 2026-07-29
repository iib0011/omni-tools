import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { useTranslation } from 'react-i18next';
import { numberToWords, NumberToWordsOptions } from './service';

const initialValues: NumberToWordsOptions = {
  uppercase: false,
  useAnd: true
};

type InitialValuesType = typeof initialValues;

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Spell Out a Large Number',
    description:
      'This example converts 1,234,567 into words. The output language matches your selected UI language automatically.',
    sampleText: `1234567`,
    sampleResult: `Twelve Lakh Thirty Four Thousand Five Hundred And Sixty Seven`,
    sampleOptions: {
      uppercase: false,
      useAnd: true
    }
  },
  {
    title: 'Convert Decimal Numbers',
    description:
      'Decimal numbers are converted with the fractional part read after the decimal point word.',
    sampleText: `3.14`,
    sampleResult: `Three Point Fourteen`,
    sampleOptions: {
      uppercase: false,
      useAnd: true
    }
  },
  {
    title: 'Uppercase Output for Cheques',
    description:
      'Uppercase output is commonly required on bank cheques and legal documents to prevent alteration.',
    sampleText: `9500`,
    sampleResult: `NINE THOUSAND FIVE HUNDRED`,
    sampleOptions: {
      uppercase: true,
      useAnd: true
    }
  },
  {
    title: 'Batch Convert a List of Numbers',
    description:
      'Each line is processed independently, preserving the line structure in the output.',
    sampleText: `42
100
0
-7`,
    sampleResult: `Forty Two
One Hundred
Zero
Minus Seven`,
    sampleOptions: {
      uppercase: false,
      useAnd: true
    }
  }
];

export default function NumberToWords({ title }: ToolComponentProps) {
  const { t } = useTranslation('number');
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (optionsValues: InitialValuesType, input: string) => {
    setResult(numberToWords(input, optionsValues));
  };

  return (
    <ToolContent
      title={title}
      input={input}
      setInput={setInput}
      exampleCards={exampleCards}
      initialValues={initialValues}
      inputComponent={
        <ToolTextInput
          title={t('numberToWords.inputTitle')}
          value={input}
          onChange={setInput}
        />
      }
      resultComponent={
        <ToolTextResult
          title={t('numberToWords.outputTitle')}
          value={result}
        />
      }
      getGroups={({ values, updateField }) => [
        {
          title: t('numberToWords.options.title'),
          component: (
            <React.Fragment>
              <CheckboxWithDesc
                title={t('numberToWords.options.uppercase')}
                description={t('numberToWords.options.uppercaseDescription')}
                checked={values.uppercase}
                onChange={(value) => updateField('uppercase', value)}
              />
              <CheckboxWithDesc
                title={t('numberToWords.options.useAnd')}
                description={t('numberToWords.options.useAndDescription')}
                checked={values.useAnd}
                onChange={(value) => updateField('useAnd', value)}
              />
            </React.Fragment>
          )
        }
      ]}
      compute={compute}
      toolInfo={{
        title: t('numberToWords.toolInfo.title'),
        description: t('numberToWords.toolInfo.description')
      }}
    />
  );
}
