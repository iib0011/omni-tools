import { Box } from '@mui/material';
import { useState } from 'react';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import { replaceText } from './service';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import ToolTextInput from '@components/input/ToolTextInput';
import SimpleRadio from '@components/options/SimpleRadio';
import { initialValues, InitialValuesType } from './initialValues';
import ToolContent from '@components/ToolContent';
import { CardExampleType } from '@components/examples/ToolExamples';
import { ToolComponentProps } from '@tools/defineTool';
import { useTranslation } from 'react-i18next';

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Replace specific word in text',
    description:
      'In this example we will replace the word "hello" with the word "hi". This example doesn\'t use regular expressions.',
    sampleText: 'hello, how are you today? hello!',
    sampleResult: 'hi, how are you today? hi!',
    sampleOptions: {
      textToReplace: 'hello, how are you today? hello!',
      searchValue: 'hello',
      searchRegexp: '',
      replaceValue: 'hi',
      mode: 'text'
    }
  },
  {
    title: 'Replace all numbers in text',
    description:
      'In this example we will replace all numbers in numbers with * using regexp. In the output we will get text with numbers replaced with *.',
    sampleText: 'The price is 100$, and the discount is 20%.',
    sampleResult: 'The price is X$, and the discount is X%.',
    sampleOptions: {
      textToReplace: 'The price is 100$, and the discount is 20%.',
      searchValue: '',
      searchRegexp: '/\\d+/g',
      replaceValue: '*',
      mode: 'regexp'
    }
  },
  {
    title: 'Replace all dates in text',
    description:
      'In this example we will replace all dates in the format YYYY-MM-DD with the word DATE using regexp. The output will have all the dates replaced with the word DATE.',
    sampleText:
      'The event will take place on 2025-03-10, and the deadline is 2025-03-15.',
    sampleResult:
      'The event will take place on DATE, and the deadline is DATE.',
    sampleOptions: {
      textToReplace:
        'The event will take place on 2025-03-10, and the deadline is 2025-03-15.',
      searchValue: '',
      searchRegexp: '/\\d{4}-\\d{2}-\\d{2}/g',
      replaceValue: 'DATE',
      mode: 'regexp'
    }
  }
];

export default function Replacer({ title }: ToolComponentProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  function compute(optionsValues: InitialValuesType, input: string) {
    setResult(replaceText(optionsValues, input));
  }

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: t('string.textReplacer.searchText'),
      component: (
        <Box>
          <SimpleRadio
            onClick={() => updateField('mode', 'text')}
            checked={values.mode === 'text'}
            title={t('string.textReplacer.findPatternInText')}
          />
          <TextFieldWithDesc
            description={t('string.textReplacer.searchPatternDescription')}
            value={values.searchValue}
            onOwnChange={(val) => updateField('searchValue', val)}
            type={'text'}
          />
          <SimpleRadio
            onClick={() => updateField('mode', 'regexp')}
            checked={values.mode === 'regexp'}
            title={t('string.textReplacer.findPatternUsingRegexp')}
          />
          <TextFieldWithDesc
            description={t('string.textReplacer.regexpDescription')}
            value={values.searchRegexp}
            onOwnChange={(val) => updateField('searchRegexp', val)}
            type={'text'}
          />
        </Box>
      )
    },
    {
      title: t('string.textReplacer.replaceText'),
      component: (
        <Box>
          <TextFieldWithDesc
            description={t('string.textReplacer.replacePatternDescription')}
            placeholder={t('string.textReplacer.newTextPlaceholder')}
            value={values.replaceValue}
            onOwnChange={(val) => updateField('replaceValue', val)}
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
          title={t('string.textReplacer.inputTitle')}
          value={input}
          onChange={setInput}
        />
      }
      resultComponent={
        <ToolTextResult
          title={t('string.textReplacer.resultTitle')}
          value={result}
        />
      }
      toolInfo={{
        title: t('string.textReplacer.toolInfo.title'),
        description: t('string.textReplacer.toolInfo.description')
      }}
      exampleCards={exampleCards}
    />
  );
}
