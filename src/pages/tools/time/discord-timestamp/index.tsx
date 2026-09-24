import { Box } from '@mui/material';
import React, { useState } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import ToolTextInput from '@components/input/ToolTextInput';
import ToolTextResult from '@components/result/ToolTextResult';
import { GetGroupsType } from '@components/options/ToolOptions';
import { CardExampleType } from '@components/examples/ToolExamples';
import SelectWithDesc from '@components/options/SelectWithDesc';
import CheckboxWithDesc from '@components/options/CheckboxWithDesc';
import { DiscordTimestampGenerator } from './service';
import { useTranslation } from 'react-i18next';
import { DiscordTimestampFormat, InitialValuesType } from './types';

const initialValues: InitialValuesType = {
  format: 'F',
  enforceUTC: true
};

const exampleCards: CardExampleType<InitialValuesType>[] = [
  {
    title: 'Convert a single datetime',
    description:
      "In this example, we convert a single datetime into a Discord timestamp using the Long Date & Time format (F). The input is an ISO 8601 datetime string and the output is a Discord timestamp that will display the full date and time in each viewer's local timezone.",
    sampleText: `2025-03-15T10:00:00`,
    sampleResult: `<t:1742032800:F>`,
    sampleOptions: {
      ...initialValues,
      format: 'F'
    }
  },
  {
    title: 'Convert multiple datetimes',
    description:
      'In this example, we convert multiple datetimes at once — one per line. Blank lines are preserved in the output. Each valid datetime is converted to a Discord timestamp using the Short Date & Time format (f).',
    sampleText: `2025-03-15T10:00:00
2025-07-20T18:45:00

2025-11-05T08:15:00`,
    sampleResult: `<t:1742032800:f>
<t:1753037100:f>

<t:1762330500:f>`,
    sampleOptions: {
      ...initialValues,
      format: 'f'
    }
  },
  {
    title: 'Relative timestamps',
    description:
      'In this example, we use the Relative format (R) which displays how long ago or how far in the future a datetime is — for example "2 hours ago" or "in 3 days". This format is useful for countdowns or activity feeds and updates dynamically in Discord.',
    sampleText: `2025-03-15T10:00:00
2025-07-20T18:45:00
2025-11-05T08:15:00`,
    sampleResult: `<t:1742032800:R>
<t:1753037100:R>
<t:1762330500:R>`,
    sampleOptions: {
      ...initialValues,
      format: 'R'
    }
  }
];

type formatProps = {
  label: string;
  value: DiscordTimestampFormat;
};

export default function TruncateClockTime({
  title,
  longDescription
}: ToolComponentProps) {
  const { t } = useTranslation('time');
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const compute = (optionsValues: InitialValuesType, input: string) => {
    setResult(DiscordTimestampGenerator(input, optionsValues));
  };

  const FORMATS: formatProps[] = [
    { label: t('discordTimestamp.formats.short_time'), value: 't' },
    { label: t('discordTimestamp.formats.long_time'), value: 'T' },
    { label: t('discordTimestamp.formats.short_date'), value: 'd' },
    { label: t('discordTimestamp.formats.long_date'), value: 'D' },
    { label: t('discordTimestamp.formats.short_datetime'), value: 'f' },
    { label: t('discordTimestamp.formats.long_datetime'), value: 'F' },
    { label: t('discordTimestamp.formats.relative'), value: 'R' }
  ];

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: t('discordTimestamp.utc.title'),
      component: (
        <Box>
          <CheckboxWithDesc
            checked={values.enforceUTC}
            onChange={(value) => updateField('enforceUTC', value)}
            title={t('discordTimestamp.utc.label')}
            description={t('discordTimestamp.utc.description')}
          />
        </Box>
      )
    },
    {
      title: t('discordTimestamp.formats.title'),
      component: (
        <Box>
          <SelectWithDesc
            selected={values.format}
            onChange={(value) => updateField('format', value)}
            options={FORMATS.map((format) => ({
              label: format.label,
              value: format.value
            }))}
            description={t('discordTimestamp.formats.description')}
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
          title={t('discordTimestamp.inputTitle')}
          onChange={setInput}
        />
      }
      resultComponent={
        <ToolTextResult
          title={t('discordTimestamp.outputTitle')}
          value={result}
        />
      }
      initialValues={initialValues}
      getGroups={getGroups}
      setInput={setInput}
      compute={compute}
      toolInfo={{
        title: title,
        description: longDescription
      }}
      exampleCards={exampleCards}
    />
  );
}
