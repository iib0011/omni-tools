import { Box } from '@mui/material';
import React, { useCallback, useState } from 'react';
import * as Yup from 'yup';
import { debounce } from 'lodash';
import ToolContent from '@components/ToolContent';
import { ToolComponentProps } from '@tools/defineTool';
import { GetGroupsType } from '@components/options/ToolOptions';
import ToolVideoInput from '@components/input/ToolVideoInput';
import ToolFileResult from '@components/result/ToolFileResult';
import { convertToGif } from './service';
import { InitialValuesType } from './types';
import SimpleRadio from '@components/options/SimpleRadio';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const initialValues: InitialValuesType = {
  resolution: '720p',
  frameRate: 30
};

const validationSchema = Yup.object({
  resolution: Yup.string().required('Resolution is required'),
  frameRate: Yup.number().min(1).max(60).required('Frame rate is required')
});

const resolutionOptions = [
  { value: '720p', label: '720p (1280x720)' },
  { value: '360p', label: '360p (640x360)' }
];

export default function ConvertToGif({ title }: ToolComponentProps) {
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
      const gifFile = await convertToGif(input, optionsValues);
      setResult(gifFile);
    } catch (error) {
      console.error('Error converting to GIF:', error);
      setResult(null);
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
      title: 'Resolution',
      component: (
        <Box>
          {resolutionOptions.map((option) => (
            <SimpleRadio
              key={option.value}
              title={option.label}
              checked={values.resolution === option.value}
              onClick={() => updateField('resolution', option.value)}
            />
          ))}
        </Box>
      )
    },
    {
      title: 'Frame Rate',
      component: (
        <Box sx={{ mb: 2 }}>
          <Slider
            min={1}
            max={60}
            value={values.frameRate}
            onChange={(value) => {
              updateField(
                'frameRate',
                typeof value === 'number' ? value : value[0]
              );
            }}
            marks={{
              10: '10fps',
              30: '30fps (Default)',
              60: '60fps'
            }}
            style={{ width: '90%' }}
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
          title={'Input Video'}
        />
      }
      resultComponent={
        <ToolFileResult
          title="Converted GIF"
          value={result}
          extension="gif"
          loading={loading}
          loadingText="Converting video to GIF..."
        />
      }
      initialValues={initialValues}
      getGroups={getGroups}
      compute={debouncedCompute}
      setInput={setInput}
      validationSchema={validationSchema}
      toolInfo={{
        title: 'Convert Video to GIF',
        description:
          'Easily convert short videos to GIF format with customizable resolution and frame rate.'
      }}
    />
  );
}
