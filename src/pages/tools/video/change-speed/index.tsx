import { Box, Slider, Typography } from '@mui/material';
import React, { useState, useCallback } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import { InitialValuesType } from './types';
import ToolVideoInput from '@components/input/ToolVideoInput';
import ToolFileResult from '@components/result/ToolFileResult';
import { ChangeVideoSpeed } from './service';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash/debounce';

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

    try {
      setLoading(true);
      const resultFile = await ChangeVideoSpeed(input, optionsValues);
      setResult(resultFile);
    } catch (error) {
      console.error('Conversion failed:', error);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const debouncedCompute = useCallback(debounce(compute, 1000), []);

  const getGroups: GetGroupsType<InitialValuesType> | null = ({
    values,
    updateField
  }) => [
    {
      title: t('changeSpeed.options'),
      component: (
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t('changeSpeed.speedLabel')} {values.speed}
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
          title={t('changeSpeed.inputTitle')}
        />
      }
      resultComponent={
        <ToolFileResult
          title={t('changeSpeed.resultTitle')}
          loading={loading}
          value={result}
          extension="mp4"
        />
      }
      initialValues={initialValues}
      getGroups={getGroups}
      setInput={setInput}
      compute={debouncedCompute}
      toolInfo={{
        title: t('changeSpeed.toolInfo.title', { title }),
        description: t('changeSpeed.toolInfo.longDescription', { title })
      }}
    />
  );
}
