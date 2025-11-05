import { Box, FormControlLabel, Switch } from '@mui/material';
import { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import { CardExampleType } from '@components/examples/ToolExamples';
import { unicode } from './service';
import { InitialValuesType } from './types';
import SimpleRadio from '@components/options/SimpleRadio';
import { useTranslation } from 'react-i18next';

const initialValues: InitialValuesType = {
  mode: 'encode',
  uppercase: false
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Encode to Unicode Escape',
    description: 'Encode plain text to Unicode escape sequences.',
    sampleText: 'Hello, World!',
    sampleResult:
      '\\u0048\\u0065\\u006c\\u006c\\u006f\\u002c\\u0020\\u0057\\u006f\\u0072\\u006c\\u0064\\u0021',
    sampleOptions: {
      mode: 'encode',
      uppercase: false
    }
  },
  {
    title: 'Encode to Unicode Escape (Uppercase)',
    description: 'Encode plain text to uppercase Unicode escape sequences.',
    sampleText: 'Hello, World!',
    sampleResult:
      '\\u0048\\u0065\\u006c\\u006c\\u006f\\u002c\\u0020\\u0057\\u006f\\u0072\\u006c\\u0064\\u0021'.toUpperCase(),
    sampleOptions: {
      mode: 'encode',
      uppercase: true
    }
  },
  {
    title: 'Decode Unicode Escape',
    description: 'Decode Unicode escape sequences back to plain text.',
    sampleText:
      '\\u0048\\u0065\\u006c\\u006c\\u006f\\u002c\\u0020\\u0057\\u006f\\u0072\\u006c\\u0064\\u0021',
    sampleResult: 'Hello, World!',
    sampleOptions: {
      mode: 'decode',
      uppercase: false
    }
  }
];
export default function Unicode({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation('string');
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (values: InitialValuesType, input: string) => {
    if (!input) return;
    setResult(unicode(input, values.mode === 'encode', values.uppercase));
  };

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: t('unicode.optionsTitle'),
      component: (
        <Box>
          <SimpleRadio
            onClick={() => updateField('mode', 'encode')}
            checked={values.mode === 'encode'}
            title={t('unicode.encode')}
          />
          <SimpleRadio
            onClick={() => updateField('mode', 'decode')}
            checked={values.mode === 'decode'}
            title={t('unicode.decode')}
          />
        </Box>
      )
    },
    {
      title: t('unicode.caseOptionsTitle'),
      component: (
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={values.uppercase}
                onChange={(e) => updateField('uppercase', e.target.checked)}
                disabled={values.mode === 'decode'}
              />
            }
            label={t('unicode.uppercase')}
          />
        </Box>
      )
    }
  ];
  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <ToolTextInput
          value={input}
          onChange={setInput}
          title={t('unicode.inputTitle')}
        />
      }
      resultComponent={
        <ToolTextResult value={result} title={t('unicode.resultTitle')} />
      }
      initialValues={initialValues}
      exampleCards={exampleCards}
      getGroups={getGroups}
      setInput={setInput}
      compute={compute}
      toolInfo={{
        title: t('unicode.toolInfo.title'),
        description: t('unicode.toolInfo.description')
      }}
    />
  );
}
