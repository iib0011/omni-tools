import { Box } from '@mui/material';
import React, { useState, useCallback } from 'react';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import TextFieldWithDesc from '@components/options/TextFieldWithDesc';
import { updateNumberField } from '@utils/string';
import { InitialValuesType, GIF_PRESETS, Quality } from './types';
import ToolVideoInput from '@components/input/ToolVideoInput';
import ToolFileResult from '@components/result/ToolFileResult';
import SimpleRadio from '@components/options/SimpleRadio';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';
import { videoToGif } from './service';

const initialValues: InitialValuesType = {
  quality: 'mid',
  start: 0,
  end: 100
};

export default function VideoToGif({ title }: ToolComponentProps) {
  const { t } = useTranslation('video');
  const [input, setInput] = useState<File | null>(null);
  const [result, setResult] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const compute = async (values: InitialValuesType, input: File | null) => {
    if (!input) return;
    setLoading(true);

    try {
      const resultFile = await videoToGif(input, values);
      setResult(resultFile);
    } catch (error) {
      console.error('Error converting video to gif:', error);
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
      title: t('videoToGif.options.quality'),
      component: (
        <Box>
          {(Object.keys(GIF_PRESETS) as Quality[]).map((quality) => (
            <SimpleRadio
              key={quality}
              title={t(`videoToGif.options.${quality}`)}
              checked={values.quality === quality}
              onClick={() => updateField('quality', quality)}
            />
          ))}
        </Box>
      )
    },
    {
      title: t('videoToGif.options.timestamps'),
      component: (
        <Box>
          <TextFieldWithDesc
            onOwnChange={(value) =>
              updateNumberField(value, 'start', updateField)
            }
            value={values.start}
            label={t('videoToGif.options.startTime')}
            sx={{ mb: 2, backgroundColor: 'background.paper' }}
          />
          <TextFieldWithDesc
            onOwnChange={(value) =>
              updateNumberField(value, 'end', updateField)
            }
            value={values.end}
            label={t('videoToGif.options.endTime')}
          />
        </Box>
      )
    }
  ];

  return (
    <ToolContent
      title={title}
      input={input}
      renderCustomInput={({ start, end }, setFieldValue) => {
        return (
          <ToolVideoInput
            value={input}
            onChange={setInput}
            title={t('videoToGif.inputTitle')}
            showTrimControls={true}
            onTrimChange={(start, end) => {
              setFieldValue('start', start);
              setFieldValue('end', end);
            }}
            trimStart={start}
            trimEnd={end}
          />
        );
      }}
      resultComponent={
        <ToolFileResult
          title={t('videoToGif.resultTitle')}
          loading={loading}
          value={result}
          extension="gif"
        />
      }
      initialValues={initialValues}
      getGroups={getGroups}
      setInput={setInput}
      compute={debouncedCompute}
    />
  );
}
