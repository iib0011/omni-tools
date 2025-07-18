import { Box, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import { InitialValuesType } from './types';
import ToolAudioInput from '@components/input/ToolAudioInput';
import ToolFileResult from '@components/result/ToolFileResult';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { trimAudio } from './service';

const initialValues: InitialValuesType = {
  startTime: '00:00:00',
  endTime: '00:01:00',
  outputFormat: 'mp3'
};

const formatOptions = [
  { label: 'MP3', value: 'mp3' },
  { label: 'AAC', value: 'aac' },
  { label: 'WAV', value: 'wav' }
];

export default function Trim({ title, longDescription }: ToolComponentProps) {
  const { t } = useTranslation('audio');
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const compute = async (
    optionsValues: InitialValuesType,
    input: File | null
  ) => {
    if (!input) return;
    setLoading(true);
    try {
      const trimmedFile = await trimAudio(input, optionsValues);
      setResult(trimmedFile);
    } catch (err) {
      console.error(`Failed to trim audio: ${err}`);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: t('trim.timeSettings'),
      component: (
        <Box>
          <TextFieldWithDesc
            value={values.startTime}
            onOwnChange={(val) => updateField('startTime', val)}
            description={t('trim.startTimeDescription')}
            label={t('trim.startTime')}
          />
          <Box mt={2}>
            <TextFieldWithDesc
              value={values.endTime}
              onOwnChange={(val) => updateField('endTime', val)}
              description={t('trim.endTimeDescription')}
              label={t('trim.endTime')}
            />
          </Box>
        </Box>
      )
    },
    {
      title: t('trim.outputFormat'),
      component: (
        <Box mt={2}>
          <RadioGroup
            row
            value={values.outputFormat}
            onChange={(e) =>
              updateField(
                'outputFormat',
                e.target.value as 'mp3' | 'aac' | 'wav'
              )
            }
          >
            {formatOptions.map((opt) => (
              <FormControlLabel
                key={opt.value}
                value={opt.value}
                control={<Radio />}
                label={opt.label}
              />
            ))}
          </RadioGroup>
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <ToolAudioInput
          value={input}
          onChange={setInput}
          title={t('trim.inputTitle')}
        />
      }
      resultComponent={
        loading ? (
          <ToolFileResult
            title={t('trim.trimmingAudio')}
            value={null}
            loading={true}
          />
        ) : (
          <ToolFileResult
            title={t('trim.resultTitle')}
            value={result}
            extension={result ? result.name.split('.').pop() : undefined}
          />
        )
      }
      initialValues={initialValues}
      getGroups={getGroups}
      setInput={setInput}
      compute={compute}
      toolInfo={{
        title: t('trim.toolInfo.title', { title }),
        description: longDescription
      }}
    />
  );
}
