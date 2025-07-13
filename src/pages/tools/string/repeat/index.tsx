import { Box } from '@mui/material';
import { useState } from 'react';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import { repeatText } from './service';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import ToolTextInput from '@components/input/ToolTextInput';
import { initialValues, InitialValuesType } from './initialValues';
import ToolContent from '@components/ToolContent';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { useTranslation } from 'react-i18next';

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Repeat word five times',
    description: 'Repeats "Hello!" five times without any delimiter.',
    sampleText: 'Hello! ',
    sampleResult: 'Hello! Hello! Hello! Hello! Hello! ',
    sampleOptions: {
      textToRepeat: 'Hello! ',
      repeatAmount: '5',
      delimiter: ''
    }
  },
  {
    title: 'Repeat phrase with comma',
    description:
      'Repeats "Good job" three times, separated by commas and spaces.',
    sampleText: 'Good job',
    sampleResult: 'Good job, Good job, Good job',
    sampleOptions: {
      textToRepeat: 'Good job',
      repeatAmount: '3',
      delimiter: ', '
    }
  },
  {
    title: 'Repeat number with space',
    description: 'Repeats the number "42" four times, separated by spaces.',
    sampleText: '42',
    sampleResult: '42 42 42 42',
    sampleOptions: {
      textToRepeat: '42',
      repeatAmount: '4',
      delimiter: ' '
    }
  }
];

export default function Replacer({ title }: ToolComponentProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  function compute(optionsValues: InitialValuesType, input: string) {
    setResult(repeatText(optionsValues, input));
  }

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: t('string.repeat.textRepetitions'),
      component: (
        <Box>
          <TextFieldWithDesc
            description={t('string.repeat.repeatAmountDescription')}
            placeholder={t('string.repeat.numberPlaceholder')}
            value={values.repeatAmount}
            onOwnChange={(val) => updateField('repeatAmount', val)}
            type={'number'}
          />
        </Box>
      )
    },
    {
      title: t('string.repeat.repetitionsDelimiter'),
      component: (
        <Box>
          <TextFieldWithDesc
            description={t('string.repeat.delimiterDescription')}
            placeholder={t('string.repeat.delimiterPlaceholder')}
            value={values.delimiter}
            onOwnChange={(val) => updateField('delimiter', val)}
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
          title={t('string.repeat.inputTitle')}
          value={input}
          onChange={setInput}
        />
      }
      resultComponent={
        <ToolTextResult title={t('string.repeat.resultTitle')} value={result} />
      }
      toolInfo={{
        title: t('string.repeat.toolInfo.title'),
        description: t('string.repeat.toolInfo.description')
      }}
      exampleCards={exampleCards}
    />
  );
}
