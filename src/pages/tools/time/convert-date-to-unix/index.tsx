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
  useLocalTime: false
};
type InitialValuesType = typeof initialValues;

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Basic Date to Unix',
    description:
      'In this example, a plain human-readable timeframe is converted into a Unix timestamp. The UTC offset is treated as +00:00. ',
    sampleText: `1990-03-17 14:23:00
2012-12-21 00:00:00`,
    sampleResult: `637674180
1356048000`,
    sampleOptions: { useLocalTime: false }
  },
  {
    title: 'With UTC Offset',
    description:
      'In this example, the UTC offset is provided after stating the timeframe with a space.',
    sampleText: `1985-06-15 12:00:00 +00:00
2025-04-04 10:00:00 +08:00`,
    sampleResult: `487598400
1743724800`,
    sampleOptions: { useLocalTime: false }
  },
  {
    title: 'Use Local Time',
    description:
      "This example uses your browser's timezone. Any suffix provided as the UTC offset is ignored.  In this case we assume the timezone of the user to be UTC+6.",
    sampleText: `2025-04-04 07:30:00`,
    sampleResult: `1743744600`,
    sampleOptions: { useLocalTime: true }
  }
];

export default function convertDateToUnix({ title }: ToolComponentProps) {
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
      title: t('convertDateToUnix.withLabel'),
      component: (
        <Box>
          <CheckboxWithDesc
            onChange={(val) => updateField('useLocalTime', val)}
            checked={values.useLocalTime}
            title={t('convertDateToUnix.useLocalTime')}
            description={t('convertDateToUnix.useLocalTimeDescription')}
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
        title: t('convertDateToUnix.toolInfo.title'),
        description: t('convertDateToUnix.toolInfo.description')
      }}
    />
  );
}
