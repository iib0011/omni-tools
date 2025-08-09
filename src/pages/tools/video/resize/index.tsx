import { Box } from '@mui/material';
import React, { useCallback, useState } from 'react';
import * as Yup from 'yup';
import ToolFileResult from '@components/result/ToolFileResult';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import { debounce } from 'lodash';
import ToolVideoInput from '@components/input/ToolVideoInput';
import { resizeVideo, VideoResolution } from './service';
import SimpleRadio from '@components/options/SimpleRadio';
import { useTranslation } from 'react-i18next';

export const initialValues = {
  width: 854 as VideoResolution
};

export const validationSchema = Yup.object({
  width: Yup.number()
    .oneOf(
      [426, 640, 854, 1280, 1920],
      'Width must be one of the standard resolutions'
    )
    .required('Width is required')
});

const resolutionOptions: { value: VideoResolution; label: string }[] = [
  { value: 426, label: '240p' },
  { value: 640, label: '360p' },
  { value: 854, label: '480p' },
  { value: 1280, label: '720p' },
  { value: 1920, label: '1080p' }
];

export default function ResizeVideo({ title }: ToolComponentProps) {
  const { t } = useTranslation('video');
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const compute = async (
    optionsValues: typeof initialValues,
    input: File | null
  ) => {
    if (!input) return;
    setLoading(true);

    try {
      const resizedFile = await resizeVideo(input, {
        width: optionsValues.width
      });
      setResult(resizedFile);
    } catch (error) {
      console.error('Error resizing video:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedCompute = useCallback(debounce(compute, 1000), []);

  const getGroups: GetGroupsType<typeof initialValues> = ({
    values,
    updateField
  }) => [
    {
      title: t('resize.resolution'),
      component: (
        <Box>
          {resolutionOptions.map((option) => (
            <SimpleRadio
              key={option.value}
              title={option.label}
              checked={values.width === option.value}
              onClick={() => {
                updateField('width', option.value);
              }}
            />
          ))}
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <ToolVideoInput
          value={input}
          onChange={setInput}
          title={t('resize.inputTitle')}
        />
      }
      resultComponent={
        <ToolFileResult
          title={t('resize.resultTitle')}
          value={result}
          extension={'mp4'}
          loading={loading}
          loadingText={t('resize.loadingText')}
        />
      }
      initialValues={initialValues}
      getGroups={getGroups}
      compute={debouncedCompute}
      setInput={setInput}
      validationSchema={validationSchema}
    />
  );
}
