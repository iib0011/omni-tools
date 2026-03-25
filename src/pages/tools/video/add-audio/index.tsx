import { Box, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';
import * as Yup from 'yup';
import ToolFileResult from '@components/result/ToolFileResult';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import { debounce } from 'lodash';
import ToolVideoInput from '@components/input/ToolVideoInput';
import ToolAudioInput from '@components/input/ToolAudioInput';
import SimpleRadio from '@components/options/SimpleRadio';
import SelectWithDesc from '@components/options/SelectWithDesc';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { useTranslation } from 'react-i18next';
import { addAudioToVideo } from './service';
import { AddAudioFormValues, AudioMode, DurationMode } from './types';

const initialValues: AddAudioFormValues = {
  mode: 'replace',
  volume: 100,
  loop: true,
  startTime: '00:00:00',
  endTime: '00:00:00',
  durationMode: 'default'
};

const validationSchema = Yup.object({
  mode: Yup.string()
    .oneOf(['replace', 'mix'], 'Mode must be replace or mix')
    .required('Mode is required'),
  volume: Yup.number()
    .min(0, 'Volume must be at least 0')
    .max(200, 'Volume must be at most 200')
    .required('Volume is required'),
  loop: Yup.boolean().required(),
  durationMode: Yup.string()
    .oneOf(['default', 'start', 'end', 'startEnd'])
    .required(),
  startTime: Yup.string()
    .matches(/^\d{2}:\d{2}:\d{2}$/, 'Format must be HH:MM:SS')
    .required(),
  endTime: Yup.string()
    .matches(/^\d{2}:\d{2}:\d{2}$/, 'Format must be HH:MM:SS')
    .required()
});

const modeOptions: { value: AudioMode; label: string }[] = [
  { value: 'replace', label: 'replace' },
  { value: 'mix', label: 'mix' }
];

const volumeOptions: { value: string; label: string }[] = [
  { value: '0', label: 'volumeMute' },
  { value: '25', label: 'volume25' },
  { value: '50', label: 'volume50' },
  { value: '100', label: 'volume100' },
  { value: '150', label: 'volume150' },
  { value: '200', label: 'volume200' }
];

const durationModeOptions: { value: DurationMode; label: string }[] = [
  { value: 'default', label: 'durationDefault' },
  { value: 'start', label: 'durationStart' },
  { value: 'end', label: 'durationEnd' },
  { value: 'startEnd', label: 'durationStartEnd' }
];

export default function AddAudio({ title }: ToolComponentProps) {
  const { t } = useTranslation('video');
  const [videoInput, setVideoInput] = useState<File | null>(null);
  const [audioInput, setAudioInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const compute = async (
    optionsValues: typeof initialValues,
    input: File | null
  ) => {
    if (!input || !audioInput) return;
    setLoading(true);

    const startTime =
      optionsValues.durationMode === 'start' ||
      optionsValues.durationMode === 'startEnd'
        ? optionsValues.startTime
        : '00:00:00';
    const endTime =
      optionsValues.durationMode === 'end' ||
      optionsValues.durationMode === 'startEnd'
        ? optionsValues.endTime
        : '00:00:00';

    try {
      const outputFile = await addAudioToVideo(input, audioInput, {
        mode: optionsValues.mode,
        volume: optionsValues.volume,
        loop: optionsValues.loop,
        startTime,
        endTime
      });
      setResult(outputFile);
    } catch (error) {
      console.error('Error adding audio to video:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedCompute = useCallback(debounce(compute, 1000), [audioInput]);

  const getGroups: GetGroupsType<typeof initialValues> = ({
    values,
    updateField
  }) => [
    {
      title: t('addAudio.audioFile'),
      component: (
        <ToolAudioInput
          value={audioInput}
          onChange={setAudioInput}
          title={t('addAudio.audioInputTitle')}
        />
      )
    },
    {
      title: t('addAudio.mode'),
      component: (
        <Box>
          {modeOptions.map((option) => (
            <SimpleRadio
              key={option.value}
              title={
                option.value === 'replace'
                  ? t('addAudio.modeReplace')
                  : t('addAudio.modeMix')
              }
              checked={values.mode === option.value}
              onClick={() => {
                updateField('mode', option.value);
              }}
            />
          ))}
          <Typography mt={3} mb={1} fontSize={22}>
            {t('addAudio.sound')}
          </Typography>
          <SimpleRadio
            title={t('addAudio.loop')}
            checked={values.loop === true}
            onClick={() => updateField('loop', true)}
          />
          <SimpleRadio
            title={t('addAudio.noLoop')}
            checked={values.loop === false}
            onClick={() => updateField('loop', false)}
          />
        </Box>
      )
    },
    {
      title: t('addAudio.volume'),
      component: (
        <Box>
          <SelectWithDesc
            selected={values.volume.toString()}
            options={volumeOptions.map((opt) => ({
              label: t(`addAudio.${opt.label}`),
              value: opt.value
            }))}
            onChange={(value) => updateField('volume', Number(value))}
            description={t('addAudio.volumeDesc')}
          />
          <Typography mt={2} mb={1} fontSize={22}>
            {t('addAudio.duration')}
          </Typography>
          <SelectWithDesc
            selected={values.durationMode}
            options={durationModeOptions.map((opt) => ({
              label: t(`addAudio.${opt.label}`),
              value: opt.value
            }))}
            onChange={(value) => {
              updateField('durationMode', value as DurationMode);
              if (value === 'default') {
                updateField('startTime', '00:00:00');
                updateField('endTime', '00:00:00');
              }
            }}
            description={t('addAudio.durationModeDesc')}
          />
          {(values.durationMode === 'start' ||
            values.durationMode === 'startEnd') && (
            <Box mt={1}>
              <TextFieldWithDesc
                value={values.startTime}
                onOwnChange={(val: string) => updateField('startTime', val)}
                label={t('addAudio.startTime')}
                description={t('addAudio.startTimeDesc')}
              />
            </Box>
          )}
          {(values.durationMode === 'end' ||
            values.durationMode === 'startEnd') && (
            <Box mt={1}>
              <TextFieldWithDesc
                value={values.endTime}
                onOwnChange={(val: string) => updateField('endTime', val)}
                label={t('addAudio.endTime')}
                description={t('addAudio.endTimeDesc')}
              />
            </Box>
          )}
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      input={videoInput}
      inputComponent={
        <ToolVideoInput
          value={videoInput}
          onChange={setVideoInput}
          title={t('addAudio.videoInputTitle')}
        />
      }
      resultComponent={
        <ToolFileResult
          title={t('addAudio.resultTitle')}
          value={result}
          extension={'mp4'}
          loading={loading}
          loadingText={t('addAudio.loadingText')}
        />
      }
      initialValues={initialValues}
      getGroups={getGroups}
      compute={debouncedCompute}
      setInput={setVideoInput}
      validationSchema={validationSchema}
    />
  );
}
