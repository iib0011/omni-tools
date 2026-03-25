import { Box, Typography, Slider } from '@mui/material';
import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';
import ToolFileResult from '@components/result/ToolFileResult';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import ToolVideoInput from '@components/input/ToolVideoInput';
import ToolAudioInput from '@components/input/ToolAudioInput';
import SimpleRadio from '@components/options/SimpleRadio';
import SelectWithDesc from '@components/options/SelectWithDesc';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { useTranslation } from 'react-i18next';
import { addAudioToVideo } from './service';
import { AudioMode, timingMode, initialValuesType } from './types';

const initialValues: initialValuesType = {
  mode: 'replace',
  volume: 100,
  loop: true,
  startTime: '00:00:00',
  endTime: '00:00:00',
  timingMode: 'default'
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
  timingMode: Yup.string()
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

const durationModeOptions: { value: timingMode; label: string }[] = [
  { value: 'default', label: 'timingDefault' },
  { value: 'start', label: 'timingStart' },
  { value: 'end', label: 'timingEnd' },
  { value: 'startEnd', label: 'timingStartEnd' }
];

export default function AddAudio({ title }: ToolComponentProps) {
  const { t } = useTranslation('video');
  const [videoInput, setVideoInput] = useState<File | null>(null);
  const [audioInput, setAudioInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const compute = async (
    optionsValues: initialValuesType,
    input: File | null
  ) => {
    if (!input || !audioInput) return;

    try {
      setLoading(true);

      const outputFile = await addAudioToVideo(
        input,
        audioInput,
        optionsValues
      );
      setResult(outputFile);
    } catch (error) {
      console.error('Error adding audio to video:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (videoInput && audioInput) {
      compute(initialValues, videoInput);
    }
  });

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
            {t('addAudio.loopOption')}
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
          <Slider
            value={values.volume}
            onChange={(_, value) =>
              updateField('volume', Array.isArray(value) ? value[0] : value)
            }
            min={0}
            max={200}
            step={1}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}%`}
            sx={{ mt: 1 }}
          />

          <Typography mt={0.5} fontSize={14}>
            {values.volume}%
          </Typography>

          <Typography mt={2} mb={1} fontSize={22}>
            {t('addAudio.timing')}
          </Typography>
          <SelectWithDesc
            selected={values.timingMode}
            options={durationModeOptions.map((opt) => ({
              label: t(`addAudio.${opt.label}`),
              value: opt.value
            }))}
            onChange={(value) => {
              updateField('timingMode', value);
              if (value === 'default') {
                updateField('startTime', '00:00:00');
                updateField('endTime', '00:00:00');
              }
            }}
            description={t('addAudio.timingModeDesc')}
          />
          {(values.timingMode === 'start' ||
            values.timingMode === 'startEnd') && (
            <Box mt={1}>
              <TextFieldWithDesc
                value={values.startTime}
                onOwnChange={(val: string) => updateField('startTime', val)}
                label={t('addAudio.startTime')}
                description={t('addAudio.startTimeDesc')}
              />
            </Box>
          )}
          {(values.timingMode === 'end' ||
            values.timingMode === 'startEnd') && (
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
      compute={compute}
      setInput={setVideoInput}
      validationSchema={validationSchema}
    />
  );
}
