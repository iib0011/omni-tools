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
  includeAnd: true
};

type InitialValuesType = typeof initialValues;

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Spell Out a Large Number',
    description:
      'This example converts the number 1,234,567 into its English word form. The tool reads each group of three digits and appends the correct scale word (thousand, million, etc.).',
    sampleText: `1234567`,
    sampleResult: `one million two hundred and thirty-four thousand five hundred and sixty-seven`,
    sampleOptions: {
      uppercase: false,
      includeAnd: true
    }
  },
  {
    title: 'Convert Decimal Numbers',
    description:
      'In this example, we convert a decimal number into words. The integer part is spelled normally, followed by "point" and each fractional digit read individually.',
    sampleText: `3.14`,
    sampleResult: `three point one four`,
    sampleOptions: {
      uppercase: false,
      includeAnd: true
    }
  },
  {
    title: 'Uppercase Output for Cheques',
    description:
      'This example spells out a number in uppercase, which is the format commonly required on bank cheques and legal documents to prevent alteration.',
    sampleText: `9500`,
    sampleResult: `NINE THOUSAND FIVE HUNDRED AND`,
    sampleOptions: {
      uppercase: true,
      includeAnd: true
    }
  },
  {
    title: 'Batch Convert a List of Numbers',
    description:
      'This example converts multiple numbers at once, one per line. Each line is processed independently, preserving the line structure in the output.',
    sampleText: `42
100
0
-7`,
    sampleResult: `forty-two
one hundred
zero
negative seven`,
    sampleOptions: {
      uppercase: false,
      includeAnd: true
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
        <ToolTextResult title={t('numberToWords.outputTitle')} value={result} />
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
                title={t('numberToWords.options.includeAnd')}
                description={t('numberToWords.options.includeAndDescription')}
                checked={values.includeAnd}
                onChange={(value) => updateField('includeAnd', value)}
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
