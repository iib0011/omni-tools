import { Box, FormControlLabel, Checkbox } from '@mui/material';
import React, { useCallback, useState } from 'react';
import * as Yup from 'yup';
import ToolFileResult from '@components/result/ToolFileResult';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import { debounce } from 'lodash';
import ToolVideoInput from '@components/input/ToolVideoInput';
import SimpleRadio from '@components/options/SimpleRadio';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { updateNumberField } from '@utils/string';
import { resizeVideo, VideoResolution } from './service';
import { useTranslation } from 'react-i18next';

export const initialValues = {
  width: 480 as number,
  height: 480 as number,
  maintainAspectRatio: true,
  mode: 'preset' as 'preset' | 'custom'
};

export const validationSchema = Yup.object({
  width: Yup.number()
    .min(1, 'Width must be at least 1')
    .max(7680, 'Width must be at most 7680')
    .required('Width is required'),
  height: Yup.number()
    .min(1, 'Height must be at least 1')
    .max(4320, 'Height must be at most 4320')
    .required('Height is required'),
  maintainAspectRatio: Yup.boolean(),
  mode: Yup.string().oneOf(['preset', 'custom'])
});

const resolutionOptions: { value: VideoResolution; label: string }[] = [
  { value: 240, label: '240p' },
  { value: 360, label: '360p' },
  { value: 480, label: '480p' },
  { value: 720, label: '720p (HD)' },
  { value: 1080, label: '1080p (Full HD)' }
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
        width: optionsValues.width,
        height: optionsValues.height,
        maintainAspectRatio: optionsValues.maintainAspectRatio
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
      title: t('resize.mode'),
      component: (
        <Box>
          <SimpleRadio
            title={t('resize.presetMode')}
            description={t('resize.presetModeDesc')}
            checked={values.mode === 'preset'}
            onClick={() => {
              updateField('mode', 'preset');
              updateField('width', 480);
            }}
          />
          <SimpleRadio
            title={t('resize.customMode')}
            description={t('resize.customModeDesc')}
            checked={values.mode === 'custom'}
            onClick={() => updateField('mode', 'custom')}
          />
        </Box>
      )
    },
    ...(values.mode === 'preset'
      ? [
          {
            title: t('resize.resolution'),
            component: (
              <Box>
                {resolutionOptions.map((option) => (
                  <SimpleRadio
                    key={option.value}
                    title={option.label}
                    checked={values.width === option.value}
                    onClick={() => updateField('width', option.value)}
                  />
                ))}
              </Box>
            )
          }
        ]
      : [
          {
            title: t('resize.customDimensions'),
            component: (
              <Box>
                <TextFieldWithDesc
                  onOwnChange={(value) =>
                    updateNumberField(value, 'width', updateField)
                  }
                  value={values.width}
                  label={t('resize.width')}
                  sx={{ mb: 2, backgroundColor: 'background.paper' }}
                />
                <TextFieldWithDesc
                  onOwnChange={(value) =>
                    updateNumberField(value, 'height', updateField)
                  }
                  value={values.height}
                  label={t('resize.height')}
                  sx={{ mb: 2, backgroundColor: 'background.paper' }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.maintainAspectRatio}
                      onChange={(e) =>
                        updateField('maintainAspectRatio', e.target.checked)
                      }
                    />
                  }
                  label={t('resize.maintainAspectRatio')}
                />
              </Box>
            )
          }
        ])
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
