import { Box } from '@mui/material';
import { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import { CardExampleType } from '@components/examples/ToolExamples';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import { convertUnixToDate } from './service';
import { useTranslation } from 'react-i18next';

const initialValues = {
  withLabel: true,
  useLocalTime: false
};
type InitialValuesType = typeof initialValues;

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
    sampleOptions: { withLabel: true, useLocalTime: false }
  },
  {
    title: 'Without UTC Suffix',
    description:
      'In this example, the UTC suffix is removed from the output. This might be useful for embedding timestamps into other formats or for cleaner display.',
    sampleText: `1234567890
1672531199`,
    sampleResult: `2009-02-13 23:31:30
2022-12-31 23:59:59:000`,
    sampleOptions: { withLabel: false, useLocalTime: false }
  },
  {
    title: 'Use Local Time',
    description:
      'This example demonstrates how timestamps are shown in your local timezone rather than UTC. The UTC suffix is omitted in this case.',
    sampleText: `1721287227`,
    sampleResult: `2024-07-18 12:00:27`,
    sampleOptions: { withLabel: true, useLocalTime: true }
  }
];

export default function ConvertUnixToDate({ title }: ToolComponentProps) {
  const { t } = useTranslation('time');
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (values: typeof initialValues, input: string) => {
    setResult(convertUnixToDate(input, values.withLabel, values.useLocalTime));
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: t('convertUnixToDate.withLabel'),
      component: (
        <Box>
          <CheckboxWithDesc
            onChange={(val) => updateField('withLabel', val)}
            checked={values.withLabel}
            title={t('convertUnixToDate.addUtcLabel')}
            description={t('convertUnixToDate.addUtcLabelDescription')}
          />
          <CheckboxWithDesc
            onChange={(val) => updateField('useLocalTime', val)}
            checked={values.useLocalTime}
            title={t('convertUnixToDate.useLocalTime')}
            description={t('convertUnixToDate.useLocalTimeDescription')}
          />
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
