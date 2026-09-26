import { Box, Typography, Slider } from '@mui/material';
import React, { useState, useCallback } from 'react';
import ToolFileResult from '@components/result/ToolFileResult';
import ToolContent from '@components/ToolContent';
import { GetGroupsType } from '@components/options/ToolOptions';
import { ToolComponentProps } from '@tools/defineTool';
import ToolImageInput from '@components/input/ToolImageInput';
import { InitialValuesType } from './types';
import { changeGifSpeed } from './service';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';

const initialValues: InitialValuesType = {
  speed: 2
};
export default function ChangeSpeed({ title }: ToolComponentProps) {
  const { t } = useTranslation('video');
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
      const resultFile = await changeGifSpeed(input, optionsValues);
      setResult(resultFile);
    } catch (error) {
      console.error('Error while processing video:', error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedCompute = useCallback(debounce(compute, 1000), []);

  const getGroups: GetGroupsType<InitialValuesType> = ({
    values,
    updateField
  }) => [
    {
      title: t('gif.changeSpeed.options.title'),
      component: (
        <Box>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('gif.changeSpeed.options.speedLabel')} {values.speed}
            </Typography>
            <Slider
              value={values.speed}
              onChange={(_, value) =>
                updateField('speed', Array.isArray(value) ? value[0] : value)
              }
              min={0.25}
              max={4}
              step={0.25}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `x ${value}`}
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>
      )
    }
  ];
  return (
    <ToolContent
      title={title}
      input={input}
      inputComponent={
        <ToolImageInput
          value={input}
          onChange={setInput}
          accept={['image/gif']}
          title={t('gif.changeSpeed.inputTitle')}
        />
      }
      resultComponent={
        <ToolFileResult
          title={t('gif.changeSpeed.resultTitle')}
          value={result}
          loading={loading}
          extension={'gif'}
        />
      }
      initialValues={initialValues}
      getGroups={getGroups}
      compute={debouncedCompute}
      setInput={setInput}
    />
  );
}
