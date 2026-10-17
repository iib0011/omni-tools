import { Box } from '@mui/material';
import { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import { CardExampleType } from '@components/examples/ToolExamples';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import { UnixDateConverter } from './service';
import { useTranslation } from 'react-i18next';
import InitialValuesType from './types';
import SimpleRadio from '@components/options/SimpleRadio';

const initialValues: InitialValuesType = {
  mode: 'unix-to-date',
  withLabel: true,
  useLocalTime: false
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Basic Unix Time to Date',
    description:
      'This example shows how Unix timestamps are converted into human-readable dates. Each timestamp represents the number of seconds that have elapsed since January 1, 1970 (UTC).',
    sampleText: `0
1721287227
2147483647`,
    sampleResult: `1970-01-01 00:00:00:000 UTC
2024-07-18 10:00:27:000 UTC
2038-01-19 03:14:07:000 UTC`,
    sampleOptions: {
      mode: 'unix-to-date',
      withLabel: true,
      useLocalTime: false
    }
  },
  {
    title: 'Without UTC Suffix',
    description:
      'In this example, the UTC suffix is removed from the output. This might be useful for embedding timestamps into other formats or for cleaner display.',
    sampleText: `1234567890
1672531199`,
    sampleResult: `2009-02-13 23:31:30
2022-12-31 23:59:59:000`,
    sampleOptions: {
      mode: 'unix-to-date',
      withLabel: false,
      useLocalTime: false
    }
  },
  {
    title: 'Basic Date to Unix',
    description:
      'In this example, a plain human-readable timeframe is converted into a Unix timestamp. The UTC offset is treated as +00:00. ',
    sampleText: `1990-03-17 14:23:00
2012-12-21 00:00:00`,
    sampleResult: `637654980
1356019200`,
    sampleOptions: {
      mode: 'date-to-unix',
      withLabel: true,
      useLocalTime: false
    }
  },
  {
    title: 'With UTC Offset Provided',
    description:
      'In this example, the UTC offset is provided after stating the timeframe with a space.',
    sampleText: `1985-06-15 12:00:00 +00:00
2025-04-04 10:00:00 +08:00`,
    sampleResult: `487684800
1743732000`,
    sampleOptions: {
      mode: 'date-to-unix',
      withLabel: true,
      useLocalTime: false
    }
  }
];

export default function ConvertUnixToDate({ title }: ToolComponentProps) {
  const { t } = useTranslation('time');
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (values: InitialValuesType, input: string) => {
    setResult(UnixDateConverter(input, values));
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: t('convertUnixToDate.optionsTitle'),
      component: (
        <Box>
          <SimpleRadio
            onClick={() => updateField('mode', 'unix-to-date')}
            checked={values.mode === 'unix-to-date'}
            title={t('convertUnixToDate.unix-to-date')}
          />
          <SimpleRadio
            onClick={() => updateField('mode', 'date-to-unix')}
            checked={values.mode === 'date-to-unix'}
            title={t('convertUnixToDate.date-to-unix')}
          />
        </Box>
      )
    },
    {
      title: t('convertUnixToDate.tzOptions'),
      component: (
        <Box>
          <SimpleRadio
            onClick={() => updateField('useLocalTime', true)}
            checked={values.useLocalTime === true}
            title={t('convertUnixToDate.useLocalTime')}
          />
          <SimpleRadio
            onClick={() => updateField('useLocalTime', false)}
            checked={values.useLocalTime === false}
            title={t('convertUnixToDate.useUTC')}
          />

          {/* Only Show Add UTC Suffix Option on Convert Unix to Date and utc mode selected */}
          {values.mode === 'unix-to-date' && !values.useLocalTime && (
            <CheckboxWithDesc
              onChange={(val) => updateField('withLabel', val)}
              checked={values.withLabel}
              title={t('convertUnixToDate.addUtcLabel')}
              description={t('convertUnixToDate.addUtcLabelDescription')}
            />
          )}
        </Box>
      )
    }
  ];
  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={<ToolTextInput value={input} onChange={setInput} />}
      resultComponent={<ToolTextResult value={result} />}
      initialValues={initialValues}
      exampleCards={exampleCards}
      getGroups={getGroups}
      setInput={setInput}
      compute={compute}
      toolInfo={{
        title: t('convertUnixToDate.toolInfo.title'),
        description: t('convertUnixToDate.toolInfo.description')
      }}
    />
  );
}
