import { Box } from '@mui/material';
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
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { useTranslation } from 'react-i18next';
import { addAudioToVideo } from './service';
import { AddAudioOptions, AudioMode } from './types';

const initialValues: AddAudioOptions = {
  mode: 'replace',
  volume: 100
};

const validationSchema = Yup.object({
  mode: Yup.string()
    .oneOf(['replace', 'mix'], 'Mode must be replace or mix')
    .required('Mode is required'),
  volume: Yup.number()
    .min(0, 'Volume must be at least 0')
    .max(200, 'Volume must be at most 200')
    .required('Volume is required')
});

const modeOptions: { value: AudioMode; label: string }[] = [
  { value: 'replace', label: 'replace' },
  { value: 'mix', label: 'mix' }
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

    try {
      const outputFile = await addAudioToVideo(input, audioInput, {
        mode: optionsValues.mode,
        volume: optionsValues.volume
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
        </Box>
      )
    },
    {
      title: t('addAudio.volume'),
      component: (
        <Box sx={{ mb: 2 }}>
          <Slider
            min={0}
            max={200}
            style={{ width: '90%' }}
            value={values.volume}
            onChange={(value) => {
              updateField(
                'volume',
                typeof value === 'number' ? value : value[0]
              );
            }}
            marks={{
              0: t('addAudio.mute'),
              100: t('addAudio.normal'),
              200: t('addAudio.loud')
            }}
          />
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
